import "./types/string.extension.js";
import app from "./server/core.js";
import { PORT } from "./utils/env.js";

app.listen(PORT, '0.0.0.0', () => {
	console.log("Server started on port " + PORT);
});
