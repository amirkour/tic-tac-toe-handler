import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import Game, { strategies, DRAW, MOVE } from "min-max-tic-tac-toe";
const { RandomNextMoveGetter, MinMaxNextMoveGetter } = strategies;
import { isDev } from "./utils";

interface ResponseBody {
  error: null | string;
  board: MOVE[];
  outcome: null | string;
  nextToMove: MOVE;
  boardValue?: number;
}

/*
 * Helper that'll check if the given game has a winner.  If it does:
 * will set the given response's outcome (w/ a description of the
 * game's result) and return true.  Returns false otherwise.
 */
const gameOver = (game: Game, response: ResponseBody): boolean => {
  const winner = game.getWinner();
  if (winner == null) return false;

  response.outcome =
    winner === DRAW ? `Game over - it's a tie!` : `Game over - ${winner} wins!`;
  return true;
};

/*
 * Main/handler for this AWS Lambda function.
 * At a high-level, this handler will:
 *
 * - expect game data for a tic-tac-toe game in the request body
 * - parse said game data and apply the caller's move
 * - make a move for the computer
 * - return the resulting game board and outcome, along w/
 *   an http 200 status code
 *
 * If there are any errors along the way, an appropriate http status
 * code and error message will result.
 */
export const handler = async (
  event: any,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("\x1b[36m%s\x1b[0m", `Incoming Event: ${JSON.stringify(event)}`);
  console.log(`Incoming Context: ${JSON.stringify(context)}`);
  console.log(`dev mode: ${isDev()}`);

  let statusCode;
  const response: ResponseBody = {
    error: null,
    board: [],
    outcome: null,
    nextToMove: null,
  };

  try {
    // when straight-up lambda events come in, they sometimes appear as strings.
    // likewise, if the event is from API Gateway, it looks different - in any
    // case, we'll try to normalize the various event structures
    let requestBody: any =
      typeof event === "string" ? JSON.parse(event) : event;

    if (typeof requestBody.body === "string")
      requestBody = JSON.parse(requestBody.body);
    else if (requestBody.body != null) requestBody = requestBody.body;

    if (!requestBody.board || !(requestBody.board instanceof Array)) {
      statusCode = 400;
      throw 'Request must include a "board" parameter, which must be an array of strings';
    }

    if (isNaN(parseInt(requestBody.move))) {
      statusCode = 400;
      throw 'Request must include a "move" parameter, which must be an intenger';
    }

    const move = requestBody.move;
    const board = requestBody.board;
    const nmg = new MinMaxNextMoveGetter({ maxPly: .5 });
    const game = new Game({
      nmg,
      board,
    });

    do {
      game.makeMove(move);
      if (gameOver(game, response)) break;

      // in dev, allow the user to make both X and O moves.
      // but in prod, automate the opponent's moves
      // TODO - the client should just make the request instead of the service
      // TODO - deciding if/when to play O
      if (isDev()) {
        response.boardValue = nmg.evaluateBoardValue(game.getBoard());
      } else {
        const computersMove = game.getNextMove();
        if (computersMove != null) game.makeMove(computersMove);
        if (gameOver(game, response)) break;
      }
    } while (false);

    response.nextToMove = game.whosTurn();
    response.board = game.getBoard();
    statusCode = 200;
  } catch (e) {
    console.trace(`Encountered the following error: ${e}`);
    statusCode = statusCode ?? 500;
    response.error = `${e}`;
  }

  return {
    statusCode,
    body: JSON.stringify(response),
  };
};
