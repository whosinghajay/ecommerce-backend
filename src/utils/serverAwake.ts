import https from "https";

const keepAwake = () => {
  https.get(
    "https://digital-market-place-backend-di79.onrender.com/api/test",
    (res) => {
      console.log("Request sent to keep the server awake: " + res.statusCode);
    }
  );
};

setInterval(keepAwake, 14 * 60 * 1000);
