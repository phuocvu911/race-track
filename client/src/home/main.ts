import { mount } from 'svelte'
import { connect } from '../lib/socket.svelte.js'
import Home from './Home.svelte'
import '../app.css'

const target = document.getElementById('app')
if (!target) throw new Error('#app element not found in index.html')

connect('public')
mount(Home, { target })
