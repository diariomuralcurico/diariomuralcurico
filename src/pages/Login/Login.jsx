import React, { useState, useEffect } from "react";
import { Button, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../config/Firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "../../components/AuthContext";
import "./Login.css";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isWebView, setIsWebView] = useState(false);

  // --- Para Pruebas ---
  // Cambia a `true` para forzar la vista de WebView en un navegador normal.
  const forceWebViewForTesting = false;

  useEffect(() => {
    if (forceWebViewForTesting) {
      setIsWebView(true);
      return;
    }
    const userAgent = navigator.userAgent.toLowerCase();
    const webViewKeywords = [
      "wv",
      "webview",
      "fbav",
      "instagram",
      "fban",
      "fbdv",
      "fbss",
    ];
    setIsWebView(
      webViewKeywords.some((keyword) => userAgent.includes(keyword)),
    );
  }, [forceWebViewForTesting]);

  useEffect(() => {
    if (user) {
      navigate("/publicar");
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    if (isWebView) {
      return; // No-op in WebView, the dedicated view handles it.
    }
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

  const openInBrowser = () => {
    const url = window.location.href;
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    if (isAndroid) {
      const intentUrl = url.replace(/^(https?:\/\/)/, "");
      window.location.href = `intent://${intentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    } else if (isIOS) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(url, "_blank"); // Generic fallback
    }
  };

  if (isWebView) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
          <Card.Body className="p-6 text-center">
            <img
              src="/images/lgdmcfull2.png"
              alt="Logo Diario Mural Curicó"
              className="mx-auto h-16 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800 font-codec mb-3">
              Abre en tu Navegador
            </h2>
            <p className="text-gray-600 font-codec mb-4">
              Para iniciar sesión de forma segura, por favor continúa en el
              navegador de tu teléfono (Chrome, Safari, etc.).
            </p>
            <Button
              onClick={openInBrowser}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-codec py-2 px-4 rounded-md transition-colors duration-200"
            >
              Abrir en el navegador para continuar
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

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
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
