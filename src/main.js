import "./style.css";

import { renderConverter } from "./ui/converter.js";

document.querySelector("#app").innerHTML = "";
renderConverter(document.querySelector("#app"));
