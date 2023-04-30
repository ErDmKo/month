import { cont } from '@month/utils';
import {
    Vector2D,
    FieldType,
    ZeroOneString,
    WIDTH_INDEX,
    HEIGHT_INDEX,
    FieldState,
} from './field';

export type Margins = [
    top: number,
    left: number,
    bottom: number,
    right: number
];
export type FigureState = [
    matrix: FieldType, // 0
    position: Vector2D, // 1
    sideMargins: Margins, // 2
    isFixed: 0 | 1, // 3
    color: string // 4
];

export const IS_FIXED_INDEX = 3;

export type FigureInstance = <R>(a: (s: FigureState) => R) => R;

const theT: FieldType = [
    [0, 1, 0],
    [1, 1, 1],
];

const square: FieldType = [
    [1, 1],
    [1, 1],
];

const line: FieldType = [[1], [1], [1], [1]];

const leftL: FieldType = [
    [0, 1],
    [0, 1],
    [1, 1],
];

const rightL: FieldType = [
    [1, 0],
    [1, 0],
    [1, 1],
];

const dogR: FieldType = [
    [0, 1, 1],
    [1, 1, 0],
];
const dogL: FieldType = [
    [1, 1, 0],
    [0, 1, 1],
];

export const fullFigureList: [figure: FieldType, color: string][] = [
    [theT, '#808001'], //0
    [dogL, '#008000'], //1
    [dogR, '#018080'], //2
    [rightL, '#888'], //3
    [leftL, '#008'], //4
    [line, '#800'], //5
    [square, '#808'], //6
];
const iterMatrix = (
    matrix: FieldType,
    callback: (i: number, j: number) => number | undefined
): number => {
    const size = matrix.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const val = callback(i, j);
            if (val !== undefined) {
                return val;
            }
        }
    }
    return 0;
};
const calcMargins = (
    matrix: FieldType
): [top: number, left: number, bottom: number, right: number] => {
    const matrixWidthIndex = matrix[0].length - 1;
    const matrixHeightIndex = matrix.length - 1;
    const leftSide = iterMatrix(matrix, (i, j) => {
        if (matrix[j][i]) {
            return -i;
        }
    });
    const topSide = iterMatrix(matrix, (i, j) => {
        if (matrix[i][j]) {
            return -i;
        }
    });
    const rightSide = iterMatrix(matrix, (i, j) => {
        if (matrix[j][matrixWidthIndex - i]) {
            return -i;
        }
    });
    const bottomSide = iterMatrix(matrix, (i, j) => {
        if (matrix[matrixHeightIndex - i][j]) {
            return -i;
        }
    });
    return [topSide, leftSide, bottomSide, rightSide];
};

export const validateState = (
    matrix: FieldType,
    position: Vector2D,
    margins: Margins,
    fieldState: FieldState
) => {
    const [newX, newY] = position;
    const [field] = fieldState;
    const size = matrix.length;

    const [top, left, bottom, right] = margins;
    const sizeLeft = size + right;
    const sizeTop = size + bottom;

    let isNewPositionCorrect: 0 | 1 | 2 = 1;

    for (let i = -top; i < sizeTop; i++) {
        for (let j = -left; j < sizeLeft; j++)
            if (matrix[i][j]) {
                const rowIndex = i + newY;
                const collIndex = j + newX;
                const isBottomEnd = field[rowIndex] === undefined;
                const fixedCheck = isBottomEnd || field[rowIndex][collIndex];
                if (fixedCheck) {
                    isNewPositionCorrect = 0;
                    break;
                }
            }
    }
    return isNewPositionCorrect;
};

export const rotateFigure = (
    fieldState: FieldState,
    isLeft: boolean,
    state: FigureState,
) => {
    const [matrix, position] = state;
    const size = matrix.length;
    const result: FieldType = [];
    for (let row = 0; row < size; row++) {
        result[row] = [];
        for (let col = 0; col < size; col++) {
            if (isLeft) {
              result[row].push(matrix[size - col - 1][row]);
            } else {
              // result[row].unshift(matrix[col][row]);
            }
        }
    }
    const margins = calcMargins(result);
    const isValidState = validateState(result, position, margins, fieldState);
    if (isValidState) {
        state[0] = result;
        state[2] = margins;
    }
};
export const figureToField = (
    field: FieldType,
    isClear: ZeroOneString,
    state: FigureState
) => {
    const [matrix, position, margins, , color] = state;
    const size = matrix.length;
    const [top, left, bottom, right] = margins;
    const sizeLeft = size + right;
    const sizeTop = size + bottom;
    const [newX, newY] = position;
    for (let i = -top; i < sizeTop; i++) {
        for (let j = -left; j < sizeLeft; j++)
            if (matrix[i][j]) {
                const rowIndex = i + newY;
                const row = field[rowIndex];
                const collIndex = j + newX;
                row[collIndex] = isClear ? 0 : color;
            }
    }
};

export const isFixed = (state: FigureState) => {
    return state[IS_FIXED_INDEX];
};

export const moveFigure = (
    ctx: Window,
    vector: [x: number, y: number],
    fieldState: FieldState,
    state: FigureState
) => {
    const [matrix, position, margins, isFixed] = state;
    if (isFixed) {
        return state;
    }
    const [deltaX, deltaY] = vector;

    const [field] = fieldState;
    const [currentX, currentY] = position;
    const newX = currentX + deltaX;
    const newY = currentY + deltaY;
    const maxWidth = field[0].length;
    const maxHeight = field.length;
    const [top, left, bottom, right] = margins;
    const size = matrix.length;
    const sizeLeft = size + right;
    const sizeTop = size + bottom;
    const isValidPosition = validateState(
        matrix,
        [newX, newY],
        margins,
        fieldState
    );
    if (!isValidPosition && deltaY) {
        state[IS_FIXED_INDEX] = 1;
    }
    if (!isValidPosition) {
        return;
    }
    position[WIDTH_INDEX] = Math.max(newX, left);
    position[HEIGHT_INDEX] = Math.max(newY, top);

    position[WIDTH_INDEX] = Math.min(
        position[WIDTH_INDEX],
        maxWidth - sizeLeft
    );
    position[HEIGHT_INDEX] = Math.min(
        position[HEIGHT_INDEX],
        maxHeight - sizeTop
    );
};
export const figure = (
    ctx: Window,
    figureShapeIndex: number,
    position: Vector2D
): FigureInstance => {
    const [matrix, color] = fullFigureList[figureShapeIndex];
    const diff = matrix.length - matrix[0].length;
    if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
            const zeros = new ctx.Array(matrix[0].length).fill(0);
            matrix.push(zeros);
        }
    } else if (diff > 0) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < diff; j++) {
                matrix[i].push(0);
            }
        }
    }
    const margins = calcMargins(matrix);
    const state: FigureState = [matrix, position, margins, 0, color];
    return cont(state);
};
