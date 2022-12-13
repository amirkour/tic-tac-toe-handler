import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import Game, { strategies, DRAW, MOVE } from "min-max-tic-tac-toe";
const { RandomNextMoveGetter } = strategies;

interface ResponseBody {
  error: null | string;
  board: MOVE[];
  outcome: null | string;
  nextToMove: MOVE;
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
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  let statusCode;
  const response: ResponseBody = {
    error: null,
    board: [],
    outcome: null,
    nextToMove: null,
  };

  try {
    if (event.body == null) {
      statusCode = 400;
      throw "Request must include an event body";
    }

    const requestBody: any = JSON.parse(event.body);
    if (!requestBody.board || !(requestBody.board instanceof Array)) {
      statusCode = 400;
      throw 'Request must include a "board" parameter, which must be an array of strings';
    }

    if (!Number.isInteger(requestBody.move)) {
      statusCode = 400;
      throw 'Request must include a "move" parameter, which must be an intenger';
    }

    const move = requestBody.move;
    const board = requestBody.board;
    const game = new Game({
      nmg: new RandomNextMoveGetter({ min: 0, max: 8 }),
      board,
    });

    do {
      game.makeMove(move);
      if (gameOver(game, response)) break;

      const computersMove = game.getNextMove();
      if (computersMove != null) game.makeMove(computersMove);
      if (gameOver(game, response)) break;
    } while (false);

    response.nextToMove = game.whosTurn();
    response.board = game.getBoard();
    statusCode = 200;
  } catch (e) {
    statusCode = statusCode ?? 500;
    response.error = `${e}`;
  }

  return {
    statusCode,
    body: JSON.stringify(response),
  };
};
