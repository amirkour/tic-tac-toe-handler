import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import Game, { strategies, DRAW, MOVE } from "min-max-tic-tac-toe";
const { RandomNextMoveGetter } = strategies;

interface ResponseBody {
  error: null | string;
  board: MOVE[];
  outcome: null | string;
  nextToMove: MOVE;
}

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  let statusCode: number = 200;
  const response: ResponseBody = {
    error: null,
    board: [],
    outcome: null,
    nextToMove: null,
  };

  try {
    if (event.body == null) {
      const game = new Game({
        nmg: new RandomNextMoveGetter({ min: 0, max: 8 }),
      });

      response.board = game.getBoard();
      response.nextToMove = game.whosTurn();
    } else {
      const requestBody: any = JSON.parse(event.body);
      if (!requestBody.board || !(requestBody.board instanceof Array)) {
        statusCode = 400;
        throw 'Request must include a "board" parameter, which must be an array of string';
      }

      if (!Number.isInteger(requestBody.move)) {
        statusCode = 400;
        throw 'Request must include a "move" parameter, which must be an intenger';
      }

      const move = requestBody.move;
      const board = requestBody.board;
      const game = new Game({ nmg: new RandomNextMoveGetter(), board });
      game.makeMove(move);

      const winner = game.getWinner();
      if (winner != null) {
        response.outcome =
          winner === DRAW
            ? `Game over - it's a tie!`
            : `Game over - ${winner} wins!`;
      }
      response.nextToMove = game.whosTurn();
      response.board = game.getBoard();
    }
  } catch (e) {
    statusCode = statusCode === 200 ? 500 : statusCode;
    response.error = `${e}`;
  }

  return {
    statusCode,
    body: JSON.stringify(response),
  };
};
