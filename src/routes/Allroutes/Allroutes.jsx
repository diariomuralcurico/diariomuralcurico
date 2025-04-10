import { Routes , Route } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Inicio from '../../pages/Inicio/Inicio';
import Reservas from '../../pages/Reservas/Reservas';
import Revisar from '../../pages/Revisar/Revisar'
import Programacion from '../../pages/Programacion/Programacion'
import Cartadisp from '../../pages/Menu/CartaDisp/Cartadisp';
import EliminarCarta from '../../pages/Menu/EliminarCarta/EliminarCarta';
const Allroutes = () => {
  return (
    <Routes>
        <Route path='/' element = {<Layout/>}>
            <Route path='/quienes-somos' element = {<Inicio/>}/>
            <Route path='/publicar' element = {<Reservas/>}/>
            <Route path='/' element = {<Cartadisp/>}/>
            <Route path='/revlamafe' element = {<Revisar/>}/>

            <Route path='/programacion' element = {<Programacion/>}/>
            <Route path='/deleCard' element = {<EliminarCarta/>}/>
        </Route>
    </Routes>
  )
}

export default Allroutes