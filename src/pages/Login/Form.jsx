
import {Button, Form} from 'react-bootstrap/Button';
const Formulario = () => {
  return (
    <Form className='m-4 p-4'>
    <fieldset>
      <Form.Group className="mb-3 m-2">
        <Form.Label htmlFor="disabledTextInput">Nombre Actividad:  </Form.Label>
        <Form.Control id="disabledTextInput" placeholder="Nombre" />
      </Form.Group>
      <Form.Group className="mb-3 m-2">
        <Form.Label htmlFor="disabledSelect">categoria</Form.Label>
        <Form.Select id="disabledSelect">
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
          <option>6</option>
          <option>7</option>
          <option>8</option>
          <option>9</option>
          <option>10</option>
          <option>11</option>
          <option>12</option>
          <option>13</option>
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <div>
            <div className="row">
                <div className="col-md-4 m-2">
                    <Form.Group controlId="dob">
                        <Form.Label>Fecha a reservar</Form.Label>
                        <Form.Control type="date" name="dob" placeholder="Date" />
                    </Form.Group>
                </div>
            </div>
        </div>
        <div>
            <div className="row">
                <div className="col-md-4 m-2">
                    <Form.Group controlId="dob">
                        <Form.Label>Hora de la reserva</Form.Label>
                        <Form.Control type="time" name="dob" placeholder="time" />
                    </Form.Group>
                </div>
            </div>
        </div>
        <Form.Check
            className='m-2'
            type="checkbox"
            id="disabledFieldsetCheck"
            label="Confirmar Reserva"
        />
      </Form.Group>
      <Button type="submit" className='m-2'>Reservar</Button>
    </fieldset>
  </Form>
  )
}
export default Formulario