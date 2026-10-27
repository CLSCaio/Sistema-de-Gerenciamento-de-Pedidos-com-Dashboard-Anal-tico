const SLACK_LIMIT = 1e12;

function readCell(matrix: number[][], row: number, column: number): number {
  const line = matrix[row];
  const value = line?.[column];
  if (value === undefined) {
    throw new Error('Assignment matrix position is missing');
  }
  return value;
}

function readNumber(values: number[], index: number): number {
  const value = values[index];
  if (value === undefined) {
    throw new Error('Assignment vector position is missing');
  }
  return value;
}

export function minimizeAssignmentCost(cost: number[][]): number[] {
  const rowCount = cost.length;
  if (rowCount === 0) return [];
  const columnCount = cost[0]?.length ?? 0;
  if (columnCount === 0) return cost.map(() => -1);

  const size = Math.max(rowCount, columnCount);
  const matrix = Array.from({ length: size + 1 }, () => Array<number>(size + 1).fill(0));
  for (let row = 1; row <= rowCount; row += 1) {
    for (let column = 1; column <= columnCount; column += 1) {
      const sourceRow = cost[row - 1];
      const sourceValue = sourceRow?.[column - 1];
      if (sourceValue === undefined) {
        throw new Error('Cost matrix is not rectangular');
      }
      const targetRow = matrix[row];
      if (!targetRow) throw new Error('Assignment matrix row is missing');
      targetRow[column] = sourceValue;
    }
  }

  const rowPotential = Array<number>(size + 1).fill(0);
  const columnPotential = Array<number>(size + 1).fill(0);
  const assignedRow = Array<number>(size + 1).fill(0);
  const previousColumn = Array<number>(size + 1).fill(0);

  for (let row = 1; row <= size; row += 1) {
    assignedRow[0] = row;
    let currentColumn = 0;
    const minimumSlack = Array<number>(size + 1).fill(SLACK_LIMIT);
    const visited = Array<boolean>(size + 1).fill(false);

    do {
      visited[currentColumn] = true;
      const currentRow = readNumber(assignedRow, currentColumn);
      let delta = SLACK_LIMIT;
      let nextColumn = 0;

      for (let column = 1; column <= size; column += 1) {
        if (visited[column]) continue;
        const reduced =
          readCell(matrix, currentRow, column) -
          readNumber(rowPotential, currentRow) -
          readNumber(columnPotential, column);
        if (reduced < readNumber(minimumSlack, column)) {
          minimumSlack[column] = reduced;
          previousColumn[column] = currentColumn;
        }
        if (readNumber(minimumSlack, column) < delta) {
          delta = readNumber(minimumSlack, column);
          nextColumn = column;
        }
      }

      for (let column = 0; column <= size; column += 1) {
        if (visited[column]) {
          const matchedRow = readNumber(assignedRow, column);
          rowPotential[matchedRow] = readNumber(rowPotential, matchedRow) + delta;
          columnPotential[column] = readNumber(columnPotential, column) - delta;
        } else {
          minimumSlack[column] = readNumber(minimumSlack, column) - delta;
        }
      }

      currentColumn = nextColumn;
    } while (readNumber(assignedRow, currentColumn) !== 0);

    do {
      const prior = readNumber(previousColumn, currentColumn);
      assignedRow[currentColumn] = readNumber(assignedRow, prior);
      currentColumn = prior;
    } while (currentColumn !== 0);
  }

  const columnsByRow = Array<number>(rowCount).fill(-1);
  for (let column = 1; column <= columnCount; column += 1) {
    const matchedRow = readNumber(assignedRow, column);
    if (matchedRow >= 1 && matchedRow <= rowCount) {
      columnsByRow[matchedRow - 1] = column - 1;
    }
  }
  return columnsByRow;
}
