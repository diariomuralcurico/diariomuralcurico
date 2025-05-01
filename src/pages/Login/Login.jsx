import React, { useState } from "react";
import { Button, Form, Alert, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../config/Firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useAuth } from "../../components/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/publicar");
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/publicar");
    } catch (err) {
      setError("Correo o contraseña incorrectos. Por favor, intenta de nuevo.");
      console.error("Error en inicio de sesión:", err);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/publicar");
    } catch (err) {
      setError(
        "Error al iniciar sesión con Google. Por favor, intenta de nuevo.",
      );
      console.error("Error en inicio de sesión con Google:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <Card.Body className="p-6">
          <div className="text-center mb-6">
            <img
              src="/images/lgdmcfull2.png"
              alt="Logo Diario Mural Curicó"
              className="mx-auto h-16 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800 font-codec">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600 font-codec">
              Accede a Diario Mural Curicó
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4 font-codec">
              {error}
            </Alert>
          )}

          {/* <Form onSubmit={handleEmailLogin}>
            <Form.Group className="mb-4">
              <div className="relative">
                <Form.Control
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer font-codec border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <Form.Label className="absolute top-3 left-3 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-600 font-codec">
                  Correo Electrónico
                </Form.Label>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="relative">
                <Form.Control
                  type="password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer font-codec border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <Form.Label className="absolute top-3 left-3 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-600 font-codec">
                  Contraseña
                </Form.Label>
              </div>
            </Form.Group>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-codec py-2 rounded-md transition-colors duration-200"
            >
              Iniciar Sesión
            </Button>
          </Form> */}

          {/* <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 font-codec">o</span>
            <hr className="flex-grow border-gray-300" />
          </div> */}

          <Button
            variant="outline-dark"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border-gray-300 bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-700 font-codec py-2 rounded-md transition-colors duration-200"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="h-5"
            />
            Iniciar con Google
          </Button>

          {/* <p className="text-center mt-4 text-gray-600 font-codec">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Regístrate
            </Link>
          </p> */}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
