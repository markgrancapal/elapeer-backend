const {app}=require("./server")
const {startGenerators}=require("./generators")

//start elapeer-server
const server = app.listen(3001, () => {
    console.log('listening on port %s...', server.address().port);
  });


  //start elapeer generators
  startGenerators()