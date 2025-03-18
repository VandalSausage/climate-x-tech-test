# climate-x-tech-test

Hi! This is my Climate X technical test submission.

You should be able to boot it up by doing a yarn install at the top level and then running `yarn dev`, it will start up [here](http://localhost:5173/)

## Design Decisions

Rough MVC pattern with the server acting as the controller, the sqlite db as the model and the client as the view.

I've used a simple monorepo pattern using yarn workspaces which makes it easy to build separate packages while reducing install times and bundle sizes, plus it would be simple to add shared packages (like a shared types package).

### Storage Pattern

I've gone for SQLlite for my storage, given this is toy implementation it meant I could finish it quickly while still using an appropriate tool for this structured data. In a production instance I would probably go for a postgres db. The data is simple but structured and it would give us scope to store additional relational metadata down the line.

### Server memory management

I kept all of the data processing in memory and limited the possible file size. This isn't a production solution but it meant I could finish quicker. I'll expand on this point but in a real solution I would be streaming this data in and out of the server file system to conserve available memory.

### Data Validation

I've written this so that if one row fails data validation the whole upload fails. In practice this is too harsh and the error messaging is not detailed enough. For a first version in the real world I would attempt to parse the whole file then fail and return the line numbers which failed validation.

As this product grew in maturity there would need to be some facility to update asset data (hence why I've given them a unique id). Once that's available I would allow for partial upload successes with reporting on failed rows and then provide a method to patch a csv/json fle on top of existing data so the failed rows can be fixed and uploaded as part of the original file.

### Testing

A quick note on testing, I built out a small integration suite for the server and a unit test suite for one of the server helper functions. These are both incomplete in terms of coverage. In a production implementation, this is the level I would complete my testing at. Unit tests for my more granular functions and then top level integration tests that match up to the requirements of the server.

For the client I would build a cypress suite and try to test as much as possible on the integration level, mimicking user behaviour, with unit tests kept to a minimum and only used where there is some complex business logic to maintain (for example a complicated state transition in a reducer). Ideally there isn't much if any complicated business logic in the client - it should just be a view.

### Error Handling

I've added basic error handling to the server and rendered those errors in the client. In a real version I would have shared error codes between the client and the server so that the detail in the http responses is kept to a minimum to reduce the attack surface for any potential hostile actors and the client focused copy is stored int he client definition.

Within the server, I would created a custom error class which would let me bubble up errors from anywhere in the process with an attached status code, right now all those errors will return a 500 status which isn't correct.

The client UI leaves a lot to be desired right now but the main change I would make is to add validation to the form so the client doesn't need to send the request to get simple error messages like 'missing client id'.

## Scalability and Extension

### Large Files

The risks when handling large files are: managing server memory allocation, poor user feedback due to high latency and partway failures leaving data artifacts in the db.

When large files need to be uploaded I would chunk them in the client then progressively upload them to the server. This should allow for good feedback in the UI.

This process could then become asynchronous so as not to block the user. I would store a record of the upload (in some transitory storage space like a DynamoDB table) and then allow the server to ingest the chunks of data outside the scope of the request. SO, once the final chunk has been uploaded the user is not stuck waiting for it all to be processed. The client could poll against the success of the upload or in a more mature version I could implement a websocket connection so the server can tell the client when the upload is complete/the client can cancel the upload etc...

Errors and progress can be stored in this uploads table, it serves as the source of truth for upload status.

Within the server, all the chunks will be streamed in and out of the file system, with insert queries to the db built up from the chunks and transaction scoped so there's no risk of partially successful uploads that need to be cleaned up.

### Large Numbers of Uploads Simultaneously

The potential bottlenecks in this system, when handling large numbers of uploads, are in server memory allocation and database write capacity. To combat these I would introduce 'client_location' as a metadata point. I could then run multiple versions of the server with a loadbalancer in front of them, that routed traffic by client location.

I would also shard the database by client location so that each version of the server posted to it's own shard.

Location is my go to choice for sharding/load balancing, as it also means that the servers can be located in those geographical areas, hopefully reducing latency for the end user.

### Partial Data

I'll be making the assumption here that we have some kind of asynchronous feedback mechanism already implemented.

When data is uploaded and streamed through each row can be allocated to 1 of 3 places.

1. the row is whole and valid, it gets appended to the insert query
2. the row is invalid (and potentially incomplete), it get's marked as unable to process and the line number is returned to the client
3. the data is valid but incomplete (i.e. just an address that needs geocoding or a long/lat pair that needs reverse geocoding). This can be written to a separate csv and sent on to an asynchronous service

In the third case, this blob of data is sent to a separate server that heals the rows. It's then returned to the main server for upload as a separate chunk to process. This process is tracked in uploads table and the upload is not marked as complete until this process finished. Progress messages are sent to the client to keep the user informed.
