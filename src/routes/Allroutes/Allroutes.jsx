import { Routes , Route } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Inicio from '../../pages/Inicio/Inicio';
import Reservas from '../../pages/Reservas/Reservas';
import Cartadisp from '../../pages/Menu/Cartadisp';
import Revisar from '../../pages/Revisar/Revisar'
import Programacion from '../../pages/Programacion/Programacion'
const Allroutes = () => {
  return (
    <Routes>
        <Route path='/' element = {<Layout/>}>
            <Route path='/quienes-somos' element = {<Inicio/>}/>
            <Route path='/publicar' element = {<Reservas/>}/>
            <Route path='/' element = {<Cartadisp/>}/>
            <Route path='/revlamafe' element = {<Revisar/>}/>
            <Route path='/programacion' element = {<Programacion/>}/>
        </Route>
    </Routes>
  )
}

export default Allroutes