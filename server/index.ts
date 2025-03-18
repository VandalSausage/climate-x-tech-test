import { server } from "./src";

//TODO pull this from config
const port = 3000;
// separate this out for easy testing
server.listen(port, () => {
  console.log(`Backend app listening on port ${port}`);
});
