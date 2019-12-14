import express from 'express'

let app = express()

app.get('/', (req, res) => {
    res.send('HelloWorld')
})


app.get('/blockchain', (req, res) => {
    res.send('HelloWorld')
})

app.post('/transaction', (req, res) => {
    res.send('HelloWorld')
})


app.get('/mine', (req, res) => {
    res.send('HelloWorld')
})



app.listen(5000, ()=>{
    console.log('Listeing on port 5000...')
})