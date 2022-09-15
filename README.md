# tic-tac-toe-handler
aws lambda handler for tic-tac-toe implementation

# linking min-max-tic-tac-toe

while developing, you can't get min-max-tic-tac-toe imports to resolve until you link that project:

`npm link ../min-max-tic-tac-toe`

make sure you build the min-max-tic-tac-toe project before linking to it

# layer updating

this handler depends on min-max-tic-tac-toe - to bundle that project and upload it to an aws lambda layer, and then associate that layer to this handler, see notes in [min-max-tic-tac-toe's readme](https://github.com/amirkour/min-max-tic-tac-toe)

# uploading/updating in aws

first, make sure the min-max-tic-tac-toe code/layer is updated (read above.)

then, simply run:

`npm run redeploy`

might be a good idea to just try a build first: `npm run build` or `npm run rebuild` and make sure things compile!
