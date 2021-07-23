const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const PORT = process.env.PORT || 5500
const fetch = require('node-fetch')
// eslint-disable-next-line no-unused-vars
const helpers = require('handlebars-helpers')(['string'])
const bodyParser = require('body-parser')
const app = express()

//Middlewares
const catchErrors = asyncFunction => (...args) => asyncFunction(...args).catch(console.error)


const getAllPokemon = catchErrors(async () =>{
        const res = await fetch('https://pokeapi.co/api/v2/pokemon/?offset=20&limit=151')
        const json = await res.json()
        // console.table(json.results)
        return json
    }
)

const getPokemon = catchErrors(async (pokemon)=>{
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
    if(res.status === 404) return null
    const json = await res.json()
    return json
})

app.use(express.static(path.join(__dirname,'public'))) // Search index.js in public folder and load it

app.use(bodyParser.urlencoded({ extended: false }))  // Il va faciliter l'envoie de données de la page au serveur.


// app.engine('handlebars',exphbs()) //Define a handlebars from exphbs()                    -
app.engine('.hbs',exphbs({ extname: '.hbs' })) //Define a handlebars from exphbs()          +
// app.set('view engine','handlebars') //My view provides by handlebars                     -
app.set('view engine','.hbs') //My view provides by handlebars                              +

app.get('/',
    catchErrors(async (_, res) =>
        {
            const pokemons = await getAllPokemon()
            res.render(
                'home',
                {
                    title:'Pokemons', pokemons
                }   
            )
        }
    )
)

app.post('/search',catchErrors(async (req, res) =>{
    const search = await req.body.search
    res.redirect(`/${search}`)
}))

app.get('/notFound', (_,res) =>{
    res.render('notFound')
})

app.get('/:pokemon',
    catchErrors(async (req,res) => {
        const search = await req.params.pokemon
        const pokemon = await getPokemon(search)
        if(pokemon){
            res.render('pokemon',{ pokemon })
        }else{
            res.redirect('notFound')
        }
    }
))


app.listen(PORT,() => console.log(`Server is listining on port : ${PORT}`))