
import { useState, useEffect, useRef } from "react";
import {marked} from 'marked';
import axios from "axios";
import "./App.css";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

    useEffect(() => {
      scrollToBottom();
    }, [messages, loading]);


  const handleQuerySubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    const newMessages = [...messages, { sender: "user", text: query }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    try {
      // Hacer la solicitud al backend
      const response = await axios.post("http://localhost:8000/ask_question", {
        query: query,
      });

      const finalResponse= response.data.response
      const formattedResponse = marked(finalResponse);


      // Añadir la respuesta del servidor
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: (
            <div className="bot-message-container">
              <div
                className="final-response"
                dangerouslySetInnerHTML={{ __html: formattedResponse }}
              />
            </div>
          )
        },
      ]);
    } catch (error) {
      console.error("Error al hacer la solicitud:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Hubo un error, intenta de nuevo." },
      ]);
    } finally {
      setLoading(false); // Desactivar estado de carga
    }
  };

  return (
    <div className="chat-container">
      {/* Barra de navegación con el título */}
      <div className="header">

        <h1>MEDICABOT</h1>
        <i className="fas fa-robot"></i>
        <i className="fa-solid fa-prescription-bottle-medical"></i>
        <i className="fa-solid fa-capsules"></i>
      </div>
      <div className="chat-box">
        <div className="chat-title">
          <h2>¡Hazme una pregunta sobre medicamentos!</h2>
        </div>
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === "bot" ? "bot" : "user"}`}
            >
              <p>{message.text}</p>
            </div>
          ))}
          {loading && (
            <div className="message bot loading">
              <div className="dot-flashing"></div>
            </div>
          )}
            <div ref={messagesEndRef} /> {/* Referencia para scroll */}

        </div>
        <form onSubmit={handleQuerySubmit} className="chat-input-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="chat-input"
          />
          <button type="submit" className="send-button">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
