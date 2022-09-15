import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { Game, strategies } from "min-max-tic-tac-toe";
const { RandomNextMoveGetter } = strategies;

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  const game = new Game({ nmg: new RandomNextMoveGetter({ min: 0, max: 8 }) });
  const winner = game.getWinner();
  const board = game.getBoard();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello world from ts land and make sure its working!?",
      winner,
      board,
    }),
  };
};
