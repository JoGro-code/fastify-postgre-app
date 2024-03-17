const corsOptions = {
  origin: "*",
  methods: ["GET", "PUT", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Kustom-Header"],
  credentials: true,
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export default corsOptions;

// Erlaube Anfragen von jedem Ursprung
// Erlaubt Anfragen mit diesen Methoden
// Erlaubt diese Header in Anfragen von Clients
// Erlaubt Clients, diese Header in der Antwort zu sehen
// Legt fest, ob der Antwort-Cookie als "Access-Control-Allow-Credentials" gesendet werden soll
// Legt fest, wie lange das Ergebnis der Anfrage vorgehalten werden kann
// Optionen für Preflight-Anfragen (automatische OPTIONS-Anfragen)
