(() => {
    // src/utils/bind.ts
    var bindArgs = (bindedArgs, fn) => {
        return (...args) => {
            return fn.apply(null, bindedArgs.concat(args));
        };
    };
    var bindArg = (arg, fn) => {
        return bindArgs([arg], fn);
    };

    // src/utils/random.ts
    var randomRange = (ctx, min, max) => {
        return min + ctx.Math.random() * (max - min);
    };

    // src/utils/canvas.ts
    var fillElemWidhCanvas = (ctx, element) => {
        const canvas = ctx.document.createElement('canvas');
        ctx.Object.assign(canvas.style, {
            position: 'absolute',
            top: '0px',
            left: '0px',
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
        });
        ctx.Object.assign(element.style, {
            position: 'relative',
        });
        element.appendChild(canvas);
        const rectRaw = canvas.getBoundingClientRect();
        const rect = ctx.Object.assign(rectRaw, {
            width: rectRaw.width * 2,
            height: rectRaw.height * 2,
        });
        ctx.Object.assign(canvas, {
            width: rect.width,
            height: rect.height,
        });
        return [rect, canvas];
    };

    // src/utils/cont.ts
    var cont = (a) => (fn) => fn(a);

    // src/utils/observer.ts
    var observer = (state = []) => {
        return cont(state);
    };
    var on = (callback, state) => {
        state.push(callback);
    };
    var trigger = (event, state) => {
        for (const callback of state) {
            callback(event);
        }
    };

    // src/tetris/figure.ts
    var IS_FIXED_INDEX = 3;
    var theT = [
        [0, 1, 0],
        [1, 1, 1],
    ];
    var square = [
        [1, 1],
        [1, 1],
    ];
    var line = [[1], [1], [1], [1]];
    var leftL = [
        [0, 1],
        [0, 1],
        [1, 1],
    ];
    var rightL = [
        [1, 0],
        [1, 0],
        [1, 1],
    ];
    var dogR = [
        [0, 1, 1],
        [1, 1, 0],
    ];
    var dogL = [
        [1, 1, 0],
        [0, 1, 1],
    ];
    var fullFigureList = [
        [theT, '#808001'],
        [dogL, '#008000'],
        [dogR, '#018080'],
        [rightL, '#888'],
        [leftL, '#008'],
        [line, '#800'],
        [square, '#808'],
    ];
    var iterMatrix = (matrix, callback) => {
        const size = matrix.length;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const val = callback(i, j);
                if (val !== void 0) {
                    return val;
                }
            }
        }
        return 0;
    };
    var calcMargins = (matrix) => {
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
    var validateState = (matrix, position, margins, fieldState) => {
        const [newX, newY] = position;
        const [field] = fieldState;
        const size = matrix.length;
        const [top, left, bottom, right] = margins;
        const sizeLeft = size + right;
        const sizeTop = size + bottom;
        let isNewPositionCorrect = 1;
        for (let i = -top; i < sizeTop; i++) {
            for (let j = -left; j < sizeLeft; j++)
                if (matrix[i][j]) {
                    const rowIndex = i + newY;
                    const collIndex = j + newX;
                    const isBottomEnd = field[rowIndex] === void 0;
                    const fixedCheck =
                        isBottomEnd || field[rowIndex][collIndex];
                    if (fixedCheck) {
                        isNewPositionCorrect = 0;
                        break;
                    }
                }
        }
        return isNewPositionCorrect;
    };
    var rotateFigureLeft = (fieldState, state) => {
        const [matrix, position] = state;
        const size = matrix.length;
        const result = [];
        for (let i = 0; i < size; i++) {
            result[i] = [];
            for (let j = 0; j < size; j++) {
                result[i].push(matrix[size - j - 1][i]);
            }
        }
        const margins = calcMargins(result);
        const isValidState = validateState(
            result,
            position,
            margins,
            fieldState
        );
        if (isValidState) {
            state[0] = result;
            state[2] = margins;
        }
    };
    var figureToField = (field, isClear, state) => {
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
    var isFixed = (state) => {
        return state[IS_FIXED_INDEX];
    };
    var moveFigure = (ctx, vector, fieldState, state) => {
        const [matrix, position, margins, isFixed2] = state;
        if (isFixed2) {
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
    var figure = (ctx, figureShapeIndex, position) => {
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
        const state = [matrix, position, margins, 0, color];
        return cont(state);
    };

    // src/tetris/field.ts
    var WIDTH_INDEX = 0;
    var HEIGHT_INDEX = 1;
    var GAME_STATE_PLAY = 0;
    var GAME_STATE_END = 1;
    var LOOP_INDEX = 3;
    var OBSERVERS_INDEX = 4;
    var SCORE_INDEX = 5;
    var getObservers = (state) => {
        return state[OBSERVERS_INDEX];
    };
    var applyToFigue = (fn, state) => {
        const [field, , figures] = state;
        const result = [];
        for (let figure2 of figures)
            if (figure2) {
                figure2(bindArgs([field, 1], figureToField));
                result.push(figure2(fn));
                figure2(bindArgs([field, 0], figureToField));
            }
        return result;
    };
    var rotateFieldFigureLeft = (state) => {
        applyToFigue(bindArg(state, rotateFigureLeft), state);
    };
    var moveFieldFigure = (ctx, vector, state) => {
        applyToFigue(bindArgs([ctx, vector, state], moveFigure), state);
    };
    var chekLines = (ctx, state) => {
        const [field] = state;
        const [gameState, score] = getObservers(state);
        const lines = [];
        for (let i = 0; i < field.length; i++) {
            let lineSum = 0;
            for (let j = 0; j < field[i].length; j++) {
                lineSum += field[i][j] ? 1 : 0;
            }
            if (lineSum == field[i].length) {
                lines.push(i);
            }
            if (!i && lineSum) {
                gameState(bindArg(GAME_STATE_END, trigger));
                ctx.clearTimeout(state[LOOP_INDEX]);
                return 0;
            }
        }
        for (const line2 of lines) {
            state[SCORE_INDEX] += 1;
            score(bindArg(state[SCORE_INDEX], trigger));
            for (let i = line2; i > 0; i--) {
                for (let j = 0; j < field[i].length; j++) {
                    field[i][j] = field[i - 1][j];
                }
            }
        }
        return lines.length;
    };
    var animateField = (ctx, state) => {
        const [, , figures] = state;
        moveFieldFigure(ctx, [0, 1], state);
        state[LOOP_INDEX] = ctx.setTimeout(
            bindArgs([ctx, state], animateField),
            1e3 - state[SCORE_INDEX] * 10
        );
        for (let i = 0; i < figures.length; i++) {
            if (figures[i](isFixed)) {
                while (chekLines(ctx, state)) {}
                delete figures[i];
                figures.length = figures.length - 1;
                addFigureRandomFigure(ctx, state);
            }
        }
    };
    var initField = (ctx, boardSize, collSize) => {
        const [collums, rows] = boardSize;
        const field = [];
        for (let row = 0; row < rows; row++) {
            const rowArray = new ctx.Array(collums).fill(0);
            field.push(rowArray);
        }
        const gameOverObserver = observer();
        const scoreObserver = observer();
        const state = [
            field,
            collSize,
            [],
            0,
            [gameOverObserver, scoreObserver],
            0,
        ];
        animateField(ctx, state);
        return cont(state);
    };
    var addFigureRandomFigure = (ctx, state) => {
        const [field, , figures] = state;
        const [gameState] = getObservers(state);
        gameState(bindArg(GAME_STATE_PLAY, trigger));
        if (figures.length) {
            return;
        }
        const figureShapeIndex = ctx.Math.round(
            randomRange(ctx, 0, fullFigureList.length - 1)
        );
        const center = ctx.Math.floor(field[0].length / 2);
        const centerPosition = [center - 2, 0];
        const figureInstance = figure(ctx, figureShapeIndex, centerPosition);
        figures.push(figureInstance);
    };
    var drawField = (canvasCtx, fieldState) => {
        const margin = 5;
        const [field, cellSize, , , color] = fieldState;
        const [width, height] = cellSize;
        const rows = field.length;
        const colls = field[0].length;
        const fullHeight = rows * height;
        const fullWidth = colls * width;
        canvasCtx.clearRect(0, 0, fullWidth, fullHeight);
        for (let row = 0; row < rows; row++) {
            const y = height * row;
            canvasCtx.fillRect(0, y - 1, fullWidth, 2);
            for (let coll = 0; coll < colls; coll++) {
                const x = width * coll;
                if (!row) {
                    canvasCtx.fillRect(x - 1, 0, 2, fullHeight);
                }
                if (field[row][coll]) {
                    const color2 = field[row][coll];
                    if (typeof color2 == 'string') {
                        canvasCtx.fillStyle = color2;
                    }
                    canvasCtx.fillRect(
                        x + margin,
                        y + margin,
                        width - margin * 2,
                        height - margin * 2
                    );
                    canvasCtx.fillStyle = '#000';
                }
            }
        }
    };

    // src/tetris/tetris.ts
    var draw = (ctx, fieldInstance, canvasCtx) => {
        fieldInstance(bindArg(canvasCtx, drawField));
        ctx.requestAnimationFrame(
            bindArgs([ctx, fieldInstance, canvasCtx], draw)
        );
    };
    var getKeyHandlers = (ctx, fieldInstance) => {
        const figureBind = {
            Space: bindArg(ctx, addFigureRandomFigure),
            KeyE: rotateFieldFigureLeft,
            KeyS: bindArgs([ctx, [0, 1]], moveFieldFigure),
            KeyA: bindArgs([ctx, [-1, 0]], moveFieldFigure),
            KeyD: bindArgs([ctx, [1, 0]], moveFieldFigure),
        };
        for (let key in figureBind) {
            figureBind[key] = bindArg(figureBind[key], fieldInstance);
        }
        return figureBind;
    };
    var START_TEXT = 'Press SPACE to start';
    var phoneControlsMap = [
        ['Space', 'Start (space)'],
        ['KeyE', 'Rotate (E)'],
        ['KeyA', 'Left (A)'],
        ['KeyS', 'Down (S)'],
        ['KeyD', 'Right (D)'],
    ];
    var inlineBlock = {
        display: 'inline-block',
        margin: '5px',
    };
    var block = {
        display: 'block',
        margin: '5px auto',
    };
    var smallButton = {
        padding: '5px',
        touchAction: 'manipulation',
    };
    var phoneStyleMap = (ctx) => ({
        Space: ctx.Object.assign({}, smallButton, block),
        KeyE: ctx.Object.assign({}, smallButton, block),
        KeyS: ctx.Object.assign({}, inlineBlock, smallButton),
        KeyA: ctx.Object.assign({}, inlineBlock, smallButton),
        KeyD: ctx.Object.assign({}, inlineBlock, smallButton),
    });
    var addPhoneControls = (ctx, element, keyHandlers) => {
        const controls = ctx.document.createElement('div');
        ctx.Object.assign(element.style, {
            marginBottom: '200px',
        });
        ctx.Object.assign(controls.style, {
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
        });
        const styles = phoneStyleMap(ctx);
        phoneControlsMap.forEach(([key, name]) => {
            const elem = ctx.document.createElement('button');
            elem.innerText = name;
            const style = styles[key];
            if (style) {
                ctx.Object.assign(elem.style, style);
            }
            elem.addEventListener('click', keyHandlers[key], { passive: true });
            controls.appendChild(elem);
        });
        element.appendChild(controls);
    };
    var initCanvas = (ctx, element) => {
        const htmlElement = element;
        htmlElement.innerHTML = '';
        const boardSize = [10, 20];
        ctx.Object.assign(htmlElement.style, {
            height: '400px',
            width: '200px',
            backgroundColor: 'white',
            margin: '40px auto 0',
        });
        const info = ctx.document.createElement('div');
        ctx.Object.assign(info.style, {
            left: '0',
            right: '0',
            position: 'absolute',
            top: '-30px',
        });
        info.innerText = START_TEXT;
        element.appendChild(info);
        const [rect, canvas] = fillElemWidhCanvas(ctx, htmlElement);
        var canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) {
            return;
        }
        const [collums, rows] = boardSize;
        const collHeight = rect.height / rows;
        const collWidth = rect.width / collums;
        const collSize = [collWidth, collHeight];
        const fieldInstance = initField(ctx, boardSize, collSize);
        const keyHandlers = getKeyHandlers(ctx, fieldInstance);
        addPhoneControls(ctx, element, keyHandlers);
        document.addEventListener('keydown', (e) => {
            if (keyHandlers[e.code]) {
                keyHandlers[e.code]();
            }
        });
        const [gameState, score] = fieldInstance(getObservers);
        gameState(
            bindArg((state) => {
                if (state === GAME_STATE_PLAY && info.innerText == START_TEXT) {
                    info.innerText = '';
                } else if (state === GAME_STATE_END) {
                    info.innerText = 'Game Over';
                }
            }, on)
        );
        score(
            bindArg((no) => {
                info.innerText = `Your score ${no}`;
            }, on)
        );
        draw(ctx, fieldInstance, canvasCtx);
    };
    var initTetrisEffect = (ctx) => {
        const tags = document.querySelectorAll('.js-tetris');
        ctx.Array.from(tags).forEach(bindArg(ctx, initCanvas));
    };

    // src/app.ts
    window.addEventListener('load', () => {
        initTetrisEffect(window);
    });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vYXNzZXRzL3NyYy91dGlscy9iaW5kLnRzIiwgIi4uLy4uLy4uL2Fzc2V0cy9zcmMvdXRpbHMvcmFuZG9tLnRzIiwgIi4uLy4uLy4uL2Fzc2V0cy9zcmMvdXRpbHMvY2FudmFzLnRzIiwgIi4uLy4uLy4uL2Fzc2V0cy9zcmMvdXRpbHMvY29udC50cyIsICIuLi8uLi8uLi9hc3NldHMvc3JjL3V0aWxzL29ic2VydmVyLnRzIiwgIi4uLy4uLy4uL2Fzc2V0cy9zcmMvdGV0cmlzL2ZpZ3VyZS50cyIsICIuLi8uLi8uLi9hc3NldHMvc3JjL3RldHJpcy9maWVsZC50cyIsICIuLi8uLi8uLi9hc3NldHMvc3JjL3RldHJpcy90ZXRyaXMudHMiLCAiLi4vLi4vLi4vYXNzZXRzL3NyYy9hcHAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBjb25zdCBiaW5kQXJncyA9IChiaW5kZWRBcmdzOiBhbnlbXSwgZm46IEZ1bmN0aW9uKSA9PiB7XG4gICAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgYmluZGVkQXJncy5jb25jYXQoYXJncykpO1xuICAgIH07XG59O1xuXG5leHBvcnQgY29uc3QgYmluZEFyZyA9IDxBcmcsIFJlc3RBcmdzIGV4dGVuZHMgYW55W10sIFJlc3VsdD4oXG4gICAgYXJnOiBBcmcsXG4gICAgZm46IChhOiBBcmcsIC4uLnJlc3Q6IFJlc3RBcmdzKSA9PiBSZXN1bHRcbik6ICgoLi4ucmVzdDogUmVzdEFyZ3MpID0+IFJlc3VsdCkgPT4ge1xuICAgIHJldHVybiBiaW5kQXJncyhbYXJnXSwgZm4pO1xufTtcbiIsICJkZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgICAgIE9iamVjdDogdHlwZW9mIE9iamVjdDtcbiAgICAgICAgQXJyYXk6IHR5cGVvZiBBcnJheTtcbiAgICAgICAgTWF0aDogdHlwZW9mIE1hdGg7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgcmFuZG9tUmFuZ2UgPSAoY3R4OiBXaW5kb3csIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikgPT4ge1xuICAgIHJldHVybiBtaW4gKyBjdHguTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pO1xufTtcbiIsICJkZWNsYXJlIGdsb2JhbCB7XG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgICAgIE9iamVjdDogdHlwZW9mIE9iamVjdDtcbiAgICAgICAgQXJyYXk6IHR5cGVvZiBBcnJheTtcbiAgICAgICAgTWF0aDogdHlwZW9mIE1hdGg7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGZpbGxFbGVtV2lkaENhbnZhcyA9IChcbiAgICBjdHg6IFdpbmRvdyxcbiAgICBlbGVtZW50OiBIVE1MRGl2RWxlbWVudFxuKTogW0RPTVJlY3QsIEhUTUxDYW52YXNFbGVtZW50XSA9PiB7XG4gICAgY29uc3QgY2FudmFzID0gY3R4LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGN0eC5PYmplY3QuYXNzaWduKGNhbnZhcy5zdHlsZSwge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgdG9wOiAnMHB4JyxcbiAgICAgICAgbGVmdDogJzBweCcsXG4gICAgICAgIHBvaW50ZXJFdmVudHM6ICdub25lJyxcbiAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgfSk7XG4gICAgY3R4Lk9iamVjdC5hc3NpZ24oZWxlbWVudC5zdHlsZSwge1xuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICB9KTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgY29uc3QgcmVjdFJhdyA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCByZWN0ID0gY3R4Lk9iamVjdC5hc3NpZ24ocmVjdFJhdywge1xuICAgICAgICB3aWR0aDogcmVjdFJhdy53aWR0aCAqIDIsXG4gICAgICAgIGhlaWdodDogcmVjdFJhdy5oZWlnaHQgKiAyLFxuICAgIH0pO1xuICAgIGN0eC5PYmplY3QuYXNzaWduKGNhbnZhcywge1xuICAgICAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICB9KTtcbiAgICByZXR1cm4gW3JlY3QsIGNhbnZhc107XG59O1xuIiwgImV4cG9ydCBjb25zdCBjb250ID1cbiAgICA8U3RhdGUsIFJlc3VsdD4oYTogU3RhdGUpID0+XG4gICAgKGZuOiAoYTogU3RhdGUpID0+IFJlc3VsdCkgPT5cbiAgICAgICAgZm4oYSk7XG4iLCAiaW1wb3J0IHsgYmluZEFyZyB9IGZyb20gJy4vYmluZCc7XG5pbXBvcnQgeyBjb250IH0gZnJvbSAnLi9jb250JztcblxuZXhwb3J0IHR5cGUgT2JzZXJ2ZXJTdGF0ZTxFdmVudFR5cGU+ID0gKChlOiBFdmVudFR5cGUpID0+IHZvaWQpW107XG5leHBvcnQgdHlwZSBPYnNlcnZlckluc3RhbmNlPEV2ZW50VHlwZSwgUiA9IGFueT4gPSAoXG4gICAgYTogKHM6IE9ic2VydmVyU3RhdGU8RXZlbnRUeXBlPikgPT4gUlxuKSA9PiBSO1xuXG5leHBvcnQgY29uc3Qgb2JzZXJ2ZXIgPSA8RXZlbnRUeXBlLCBSID0gYW55PihcbiAgICBzdGF0ZSA9IFtdIGFzIE9ic2VydmVyU3RhdGU8RXZlbnRUeXBlPlxuKSA9PiB7XG4gICAgcmV0dXJuIGNvbnQ8T2JzZXJ2ZXJTdGF0ZTxFdmVudFR5cGU+LCBSPihzdGF0ZSk7XG59O1xuXG5leHBvcnQgY29uc3Qgb24gPSA8RXZlbnRUeXBlPihcbiAgICBjYWxsYmFjazogKGU6IEV2ZW50VHlwZSkgPT4gdm9pZCxcbiAgICBzdGF0ZTogT2JzZXJ2ZXJTdGF0ZTxFdmVudFR5cGU+XG4pID0+IHtcbiAgICBzdGF0ZS5wdXNoKGNhbGxiYWNrKTtcbn07XG5cbmV4cG9ydCBjb25zdCB0cmlnZ2VyID0gPEV2ZW50VHlwZT4oXG4gICAgZXZlbnQ6IEV2ZW50VHlwZSxcbiAgICBzdGF0ZTogT2JzZXJ2ZXJTdGF0ZTxFdmVudFR5cGU+XG4pID0+IHtcbiAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIHN0YXRlKSB7XG4gICAgICAgIGNhbGxiYWNrKGV2ZW50KTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc3VtT3BlcmF0b3IgPSAoc3RhdGU6IE9ic2VydmVyU3RhdGU8bnVtYmVyPikgPT4ge1xuICAgIGNvbnN0IG9sZE9ic2VydmVyID0gb2JzZXJ2ZXIoc3RhdGUpO1xuICAgIGNvbnN0IG5ld09ic2VydmVyID0gb2JzZXJ2ZXI8bnVtYmVyPigpO1xuICAgIGxldCBzdW0gPSAwO1xuICAgIG9sZE9ic2VydmVyKFxuICAgICAgICBiaW5kQXJnKChuZXdWYWw6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgc3VtICs9IG5ld1ZhbDtcbiAgICAgICAgICAgIG5ld09ic2VydmVyKGJpbmRBcmcoc3VtLCB0cmlnZ2VyKSk7XG4gICAgICAgIH0sIG9uKVxuICAgICk7XG4gICAgcmV0dXJuIG5ld09ic2VydmVyO1xufTtcbiIsICJpbXBvcnQgeyBjb250IH0gZnJvbSAnQG1vbnRoL3V0aWxzJztcbmltcG9ydCB7XG4gICAgVmVjdG9yMkQsXG4gICAgRmllbGRUeXBlLFxuICAgIFplcm9PbmVTdHJpbmcsXG4gICAgV0lEVEhfSU5ERVgsXG4gICAgSEVJR0hUX0lOREVYLFxuICAgIEZpZWxkU3RhdGUsXG59IGZyb20gJy4vZmllbGQnO1xuXG5leHBvcnQgdHlwZSBNYXJnaW5zID0gW1xuICAgIHRvcDogbnVtYmVyLFxuICAgIGxlZnQ6IG51bWJlcixcbiAgICBib3R0b206IG51bWJlcixcbiAgICByaWdodDogbnVtYmVyXG5dO1xuZXhwb3J0IHR5cGUgRmlndXJlU3RhdGUgPSBbXG4gICAgbWF0cml4OiBGaWVsZFR5cGUsIC8vIDBcbiAgICBwb3NpdGlvbjogVmVjdG9yMkQsIC8vIDFcbiAgICBzaWRlTWFyZ2luczogTWFyZ2lucywgLy8gMlxuICAgIGlzRml4ZWQ6IDAgfCAxLCAvLyAzXG4gICAgY29sb3I6IHN0cmluZyAvLyA0XG5dO1xuXG5leHBvcnQgY29uc3QgSVNfRklYRURfSU5ERVggPSAzO1xuXG5leHBvcnQgdHlwZSBGaWd1cmVJbnN0YW5jZSA9IDxSPihhOiAoczogRmlndXJlU3RhdGUpID0+IFIpID0+IFI7XG5cbmNvbnN0IHRoZVQ6IEZpZWxkVHlwZSA9IFtcbiAgICBbMCwgMSwgMF0sXG4gICAgWzEsIDEsIDFdLFxuXTtcblxuY29uc3Qgc3F1YXJlOiBGaWVsZFR5cGUgPSBbXG4gICAgWzEsIDFdLFxuICAgIFsxLCAxXSxcbl07XG5cbmNvbnN0IGxpbmU6IEZpZWxkVHlwZSA9IFtbMV0sIFsxXSwgWzFdLCBbMV1dO1xuXG5jb25zdCBsZWZ0TDogRmllbGRUeXBlID0gW1xuICAgIFswLCAxXSxcbiAgICBbMCwgMV0sXG4gICAgWzEsIDFdLFxuXTtcblxuY29uc3QgcmlnaHRMOiBGaWVsZFR5cGUgPSBbXG4gICAgWzEsIDBdLFxuICAgIFsxLCAwXSxcbiAgICBbMSwgMV0sXG5dO1xuXG5jb25zdCBkb2dSOiBGaWVsZFR5cGUgPSBbXG4gICAgWzAsIDEsIDFdLFxuICAgIFsxLCAxLCAwXSxcbl07XG5jb25zdCBkb2dMOiBGaWVsZFR5cGUgPSBbXG4gICAgWzEsIDEsIDBdLFxuICAgIFswLCAxLCAxXSxcbl07XG5cbmV4cG9ydCBjb25zdCBmdWxsRmlndXJlTGlzdDogW2ZpZ3VyZTogRmllbGRUeXBlLCBjb2xvcjogc3RyaW5nXVtdID0gW1xuICAgIFt0aGVULCAnIzgwODAwMSddLCAvLzBcbiAgICBbZG9nTCwgJyMwMDgwMDAnXSwgLy8xXG4gICAgW2RvZ1IsICcjMDE4MDgwJ10sIC8vMlxuICAgIFtyaWdodEwsICcjODg4J10sIC8vM1xuICAgIFtsZWZ0TCwgJyMwMDgnXSwgLy80XG4gICAgW2xpbmUsICcjODAwJ10sIC8vNVxuICAgIFtzcXVhcmUsICcjODA4J10sIC8vNlxuXTtcbmNvbnN0IGl0ZXJNYXRyaXggPSAoXG4gICAgbWF0cml4OiBGaWVsZFR5cGUsXG4gICAgY2FsbGJhY2s6IChpOiBudW1iZXIsIGo6IG51bWJlcikgPT4gbnVtYmVyIHwgdW5kZWZpbmVkXG4pOiBudW1iZXIgPT4ge1xuICAgIGNvbnN0IHNpemUgPSBtYXRyaXgubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2l6ZTsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCB2YWwgPSBjYWxsYmFjayhpLCBqKTtcbiAgICAgICAgICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIDA7XG59O1xuY29uc3QgY2FsY01hcmdpbnMgPSAoXG4gICAgbWF0cml4OiBGaWVsZFR5cGVcbik6IFt0b3A6IG51bWJlciwgbGVmdDogbnVtYmVyLCBib3R0b206IG51bWJlciwgcmlnaHQ6IG51bWJlcl0gPT4ge1xuICAgIGNvbnN0IG1hdHJpeFdpZHRoSW5kZXggPSBtYXRyaXhbMF0ubGVuZ3RoIC0gMTtcbiAgICBjb25zdCBtYXRyaXhIZWlnaHRJbmRleCA9IG1hdHJpeC5sZW5ndGggLSAxO1xuICAgIGNvbnN0IGxlZnRTaWRlID0gaXRlck1hdHJpeChtYXRyaXgsIChpLCBqKSA9PiB7XG4gICAgICAgIGlmIChtYXRyaXhbal1baV0pIHtcbiAgICAgICAgICAgIHJldHVybiAtaTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IHRvcFNpZGUgPSBpdGVyTWF0cml4KG1hdHJpeCwgKGksIGopID0+IHtcbiAgICAgICAgaWYgKG1hdHJpeFtpXVtqXSkge1xuICAgICAgICAgICAgcmV0dXJuIC1pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgcmlnaHRTaWRlID0gaXRlck1hdHJpeChtYXRyaXgsIChpLCBqKSA9PiB7XG4gICAgICAgIGlmIChtYXRyaXhbal1bbWF0cml4V2lkdGhJbmRleCAtIGldKSB7XG4gICAgICAgICAgICByZXR1cm4gLWk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBib3R0b21TaWRlID0gaXRlck1hdHJpeChtYXRyaXgsIChpLCBqKSA9PiB7XG4gICAgICAgIGlmIChtYXRyaXhbbWF0cml4SGVpZ2h0SW5kZXggLSBpXVtqXSkge1xuICAgICAgICAgICAgcmV0dXJuIC1pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIFt0b3BTaWRlLCBsZWZ0U2lkZSwgYm90dG9tU2lkZSwgcmlnaHRTaWRlXTtcbn07XG5cbmV4cG9ydCBjb25zdCB2YWxpZGF0ZVN0YXRlID0gKFxuICAgIG1hdHJpeDogRmllbGRUeXBlLFxuICAgIHBvc2l0aW9uOiBWZWN0b3IyRCxcbiAgICBtYXJnaW5zOiBNYXJnaW5zLFxuICAgIGZpZWxkU3RhdGU6IEZpZWxkU3RhdGVcbikgPT4ge1xuICAgIGNvbnN0IFtuZXdYLCBuZXdZXSA9IHBvc2l0aW9uO1xuICAgIGNvbnN0IFtmaWVsZF0gPSBmaWVsZFN0YXRlO1xuICAgIGNvbnN0IHNpemUgPSBtYXRyaXgubGVuZ3RoO1xuXG4gICAgY29uc3QgW3RvcCwgbGVmdCwgYm90dG9tLCByaWdodF0gPSBtYXJnaW5zO1xuICAgIGNvbnN0IHNpemVMZWZ0ID0gc2l6ZSArIHJpZ2h0O1xuICAgIGNvbnN0IHNpemVUb3AgPSBzaXplICsgYm90dG9tO1xuXG4gICAgbGV0IGlzTmV3UG9zaXRpb25Db3JyZWN0OiAwIHwgMSB8IDIgPSAxO1xuXG4gICAgZm9yIChsZXQgaSA9IC10b3A7IGkgPCBzaXplVG9wOyBpKyspIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IC1sZWZ0OyBqIDwgc2l6ZUxlZnQ7IGorKylcbiAgICAgICAgICAgIGlmIChtYXRyaXhbaV1bal0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3dJbmRleCA9IGkgKyBuZXdZO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxJbmRleCA9IGogKyBuZXdYO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzQm90dG9tRW5kID0gZmllbGRbcm93SW5kZXhdID09PSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgY29uc3QgZml4ZWRDaGVjayA9IGlzQm90dG9tRW5kIHx8IGZpZWxkW3Jvd0luZGV4XVtjb2xsSW5kZXhdO1xuICAgICAgICAgICAgICAgIGlmIChmaXhlZENoZWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzTmV3UG9zaXRpb25Db3JyZWN0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaXNOZXdQb3NpdGlvbkNvcnJlY3Q7XG59O1xuXG5leHBvcnQgY29uc3Qgcm90YXRlRmlndXJlTGVmdCA9IChcbiAgICBmaWVsZFN0YXRlOiBGaWVsZFN0YXRlLFxuICAgIHN0YXRlOiBGaWd1cmVTdGF0ZVxuKSA9PiB7XG4gICAgY29uc3QgW21hdHJpeCwgcG9zaXRpb25dID0gc3RhdGU7XG4gICAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5sZW5ndGg7XG4gICAgY29uc3QgcmVzdWx0OiBGaWVsZFR5cGUgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICByZXN1bHRbaV0gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaXplOyBqKyspIHtcbiAgICAgICAgICAgIHJlc3VsdFtpXS5wdXNoKG1hdHJpeFtzaXplIC0gaiAtIDFdW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBtYXJnaW5zID0gY2FsY01hcmdpbnMocmVzdWx0KTtcbiAgICBjb25zdCBpc1ZhbGlkU3RhdGUgPSB2YWxpZGF0ZVN0YXRlKHJlc3VsdCwgcG9zaXRpb24sIG1hcmdpbnMsIGZpZWxkU3RhdGUpO1xuICAgIGlmIChpc1ZhbGlkU3RhdGUpIHtcbiAgICAgICAgc3RhdGVbMF0gPSByZXN1bHQ7XG4gICAgICAgIHN0YXRlWzJdID0gbWFyZ2lucztcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IGZpZ3VyZVRvRmllbGQgPSAoXG4gICAgZmllbGQ6IEZpZWxkVHlwZSxcbiAgICBpc0NsZWFyOiBaZXJvT25lU3RyaW5nLFxuICAgIHN0YXRlOiBGaWd1cmVTdGF0ZVxuKSA9PiB7XG4gICAgY29uc3QgW21hdHJpeCwgcG9zaXRpb24sIG1hcmdpbnMsICwgY29sb3JdID0gc3RhdGU7XG4gICAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5sZW5ndGg7XG4gICAgY29uc3QgW3RvcCwgbGVmdCwgYm90dG9tLCByaWdodF0gPSBtYXJnaW5zO1xuICAgIGNvbnN0IHNpemVMZWZ0ID0gc2l6ZSArIHJpZ2h0O1xuICAgIGNvbnN0IHNpemVUb3AgPSBzaXplICsgYm90dG9tO1xuICAgIGNvbnN0IFtuZXdYLCBuZXdZXSA9IHBvc2l0aW9uO1xuICAgIGZvciAobGV0IGkgPSAtdG9wOyBpIDwgc2l6ZVRvcDsgaSsrKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAtbGVmdDsgaiA8IHNpemVMZWZ0OyBqKyspXG4gICAgICAgICAgICBpZiAobWF0cml4W2ldW2pdKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93SW5kZXggPSBpICsgbmV3WTtcbiAgICAgICAgICAgICAgICBjb25zdCByb3cgPSBmaWVsZFtyb3dJbmRleF07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sbEluZGV4ID0gaiArIG5ld1g7XG4gICAgICAgICAgICAgICAgcm93W2NvbGxJbmRleF0gPSBpc0NsZWFyID8gMCA6IGNvbG9yO1xuICAgICAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpc0ZpeGVkID0gKHN0YXRlOiBGaWd1cmVTdGF0ZSkgPT4ge1xuICAgIHJldHVybiBzdGF0ZVtJU19GSVhFRF9JTkRFWF07XG59O1xuXG5leHBvcnQgY29uc3QgbW92ZUZpZ3VyZSA9IChcbiAgICBjdHg6IFdpbmRvdyxcbiAgICB2ZWN0b3I6IFt4OiBudW1iZXIsIHk6IG51bWJlcl0sXG4gICAgZmllbGRTdGF0ZTogRmllbGRTdGF0ZSxcbiAgICBzdGF0ZTogRmlndXJlU3RhdGVcbikgPT4ge1xuICAgIGNvbnN0IFttYXRyaXgsIHBvc2l0aW9uLCBtYXJnaW5zLCBpc0ZpeGVkXSA9IHN0YXRlO1xuICAgIGlmIChpc0ZpeGVkKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG4gICAgY29uc3QgW2RlbHRhWCwgZGVsdGFZXSA9IHZlY3RvcjtcblxuICAgIGNvbnN0IFtmaWVsZF0gPSBmaWVsZFN0YXRlO1xuICAgIGNvbnN0IFtjdXJyZW50WCwgY3VycmVudFldID0gcG9zaXRpb247XG4gICAgY29uc3QgbmV3WCA9IGN1cnJlbnRYICsgZGVsdGFYO1xuICAgIGNvbnN0IG5ld1kgPSBjdXJyZW50WSArIGRlbHRhWTtcbiAgICBjb25zdCBtYXhXaWR0aCA9IGZpZWxkWzBdLmxlbmd0aDtcbiAgICBjb25zdCBtYXhIZWlnaHQgPSBmaWVsZC5sZW5ndGg7XG4gICAgY29uc3QgW3RvcCwgbGVmdCwgYm90dG9tLCByaWdodF0gPSBtYXJnaW5zO1xuICAgIGNvbnN0IHNpemUgPSBtYXRyaXgubGVuZ3RoO1xuICAgIGNvbnN0IHNpemVMZWZ0ID0gc2l6ZSArIHJpZ2h0O1xuICAgIGNvbnN0IHNpemVUb3AgPSBzaXplICsgYm90dG9tO1xuICAgIGNvbnN0IGlzVmFsaWRQb3NpdGlvbiA9IHZhbGlkYXRlU3RhdGUoXG4gICAgICAgIG1hdHJpeCxcbiAgICAgICAgW25ld1gsIG5ld1ldLFxuICAgICAgICBtYXJnaW5zLFxuICAgICAgICBmaWVsZFN0YXRlXG4gICAgKTtcbiAgICBpZiAoIWlzVmFsaWRQb3NpdGlvbiAmJiBkZWx0YVkpIHtcbiAgICAgICAgc3RhdGVbSVNfRklYRURfSU5ERVhdID0gMTtcbiAgICB9XG4gICAgaWYgKCFpc1ZhbGlkUG9zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwb3NpdGlvbltXSURUSF9JTkRFWF0gPSBNYXRoLm1heChuZXdYLCBsZWZ0KTtcbiAgICBwb3NpdGlvbltIRUlHSFRfSU5ERVhdID0gTWF0aC5tYXgobmV3WSwgdG9wKTtcblxuICAgIHBvc2l0aW9uW1dJRFRIX0lOREVYXSA9IE1hdGgubWluKFxuICAgICAgICBwb3NpdGlvbltXSURUSF9JTkRFWF0sXG4gICAgICAgIG1heFdpZHRoIC0gc2l6ZUxlZnRcbiAgICApO1xuICAgIHBvc2l0aW9uW0hFSUdIVF9JTkRFWF0gPSBNYXRoLm1pbihcbiAgICAgICAgcG9zaXRpb25bSEVJR0hUX0lOREVYXSxcbiAgICAgICAgbWF4SGVpZ2h0IC0gc2l6ZVRvcFxuICAgICk7XG59O1xuZXhwb3J0IGNvbnN0IGZpZ3VyZSA9IChcbiAgICBjdHg6IFdpbmRvdyxcbiAgICBmaWd1cmVTaGFwZUluZGV4OiBudW1iZXIsXG4gICAgcG9zaXRpb246IFZlY3RvcjJEXG4pOiBGaWd1cmVJbnN0YW5jZSA9PiB7XG4gICAgY29uc3QgW21hdHJpeCwgY29sb3JdID0gZnVsbEZpZ3VyZUxpc3RbZmlndXJlU2hhcGVJbmRleF07XG4gICAgY29uc3QgZGlmZiA9IG1hdHJpeC5sZW5ndGggLSBtYXRyaXhbMF0ubGVuZ3RoO1xuICAgIGlmIChkaWZmIDwgMCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGguYWJzKGRpZmYpOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHplcm9zID0gbmV3IGN0eC5BcnJheShtYXRyaXhbMF0ubGVuZ3RoKS5maWxsKDApO1xuICAgICAgICAgICAgbWF0cml4LnB1c2goemVyb3MpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChkaWZmID4gMCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hdHJpeC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBkaWZmOyBqKyspIHtcbiAgICAgICAgICAgICAgICBtYXRyaXhbaV0ucHVzaCgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBtYXJnaW5zID0gY2FsY01hcmdpbnMobWF0cml4KTtcbiAgICBjb25zdCBzdGF0ZTogRmlndXJlU3RhdGUgPSBbbWF0cml4LCBwb3NpdGlvbiwgbWFyZ2lucywgMCwgY29sb3JdO1xuICAgIHJldHVybiBjb250KHN0YXRlKTtcbn07XG4iLCAiaW1wb3J0IHtcbiAgICBiaW5kQXJnLFxuICAgIGJpbmRBcmdzLFxuICAgIGNvbnQsXG4gICAgb2JzZXJ2ZXIsXG4gICAgT2JzZXJ2ZXJJbnN0YW5jZSxcbiAgICByYW5kb21SYW5nZSxcbiAgICB0cmlnZ2VyLFxufSBmcm9tICdAbW9udGgvdXRpbHMnO1xuaW1wb3J0IHtcbiAgICBmaWd1cmVUb0ZpZWxkLFxuICAgIGZpZ3VyZSxcbiAgICBGaWd1cmVJbnN0YW5jZSxcbiAgICBmdWxsRmlndXJlTGlzdCxcbiAgICBtb3ZlRmlndXJlLFxuICAgIEZpZ3VyZVN0YXRlLFxuICAgIGlzRml4ZWQsXG4gICAgcm90YXRlRmlndXJlTGVmdCxcbn0gZnJvbSAnLi9maWd1cmUnO1xuXG5leHBvcnQgdHlwZSBaZXJvT25lU3RyaW5nID0gMCB8IDEgfCBzdHJpbmc7XG5cbmV4cG9ydCB0eXBlIEZpZWxkVHlwZSA9IFplcm9PbmVTdHJpbmdbXVtdO1xuZXhwb3J0IHR5cGUgVmVjdG9yMkQgPSBbd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJdO1xuZXhwb3J0IGNvbnN0IFdJRFRIX0lOREVYID0gMDtcbmV4cG9ydCBjb25zdCBIRUlHSFRfSU5ERVggPSAxO1xuXG5leHBvcnQgdHlwZSBHYW1lT2JzZXJ2ZXJzID0gW1xuICAgIGdhbWVTdGF0ZTogT2JzZXJ2ZXJJbnN0YW5jZTxudW1iZXI+LFxuICAgIHNjb3JlOiBPYnNlcnZlckluc3RhbmNlPG51bWJlcj5cbl07XG5cbmV4cG9ydCBjb25zdCBHQU1FX1NUQVRFX1BMQVkgPSAwO1xuZXhwb3J0IGNvbnN0IEdBTUVfU1RBVEVfRU5EID0gMTtcblxuZXhwb3J0IHR5cGUgRmllbGRTdGF0ZSA9IFtcbiAgICBmaWVsZDogRmllbGRUeXBlLCAvLyAwXG4gICAgY2VsbFNpemU6IFZlY3RvcjJELCAvLyAxXG4gICAgZmlndXJlOiBGaWd1cmVJbnN0YW5jZVtdLCAvLyAyXG4gICAgbG9vcDogbnVtYmVyLCAvLyAzXG4gICAgb2JzZXJ2ZXJzOiBHYW1lT2JzZXJ2ZXJzLCAvLyA0XG4gICAgc2NvcmU6IG51bWJlciAvLyA1XG5dO1xuY29uc3QgTE9PUF9JTkRFWCA9IDM7XG5jb25zdCBPQlNFUlZFUlNfSU5ERVggPSA0O1xuY29uc3QgU0NPUkVfSU5ERVggPSA1O1xuXG5leHBvcnQgdHlwZSBGaWVsZEluc3RhbmNlID0gPFI+KGE6IChzOiBGaWVsZFN0YXRlKSA9PiBSKSA9PiBSO1xuXG5leHBvcnQgY29uc3QgZ2V0T2JzZXJ2ZXJzID0gKHN0YXRlOiBGaWVsZFN0YXRlKSA9PiB7XG4gICAgcmV0dXJuIHN0YXRlW09CU0VSVkVSU19JTkRFWF07XG59O1xuXG5leHBvcnQgY29uc3QgYXBwbHlUb0ZpZ3VlID0gPFI+KFxuICAgIGZuOiAoZjogRmlndXJlU3RhdGUpID0+IFIsXG4gICAgc3RhdGU6IEZpZWxkU3RhdGVcbikgPT4ge1xuICAgIGNvbnN0IFtmaWVsZCwgLCBmaWd1cmVzXSA9IHN0YXRlO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAobGV0IGZpZ3VyZSBvZiBmaWd1cmVzKVxuICAgICAgICBpZiAoZmlndXJlKSB7XG4gICAgICAgICAgICBmaWd1cmUoYmluZEFyZ3MoW2ZpZWxkLCAxXSwgZmlndXJlVG9GaWVsZCkpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goZmlndXJlKGZuKSk7XG4gICAgICAgICAgICBmaWd1cmUoYmluZEFyZ3MoW2ZpZWxkLCAwXSwgZmlndXJlVG9GaWVsZCkpO1xuICAgICAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5leHBvcnQgY29uc3Qgcm90YXRlRmllbGRGaWd1cmVMZWZ0ID0gKHN0YXRlOiBGaWVsZFN0YXRlKSA9PiB7XG4gICAgYXBwbHlUb0ZpZ3VlKGJpbmRBcmcoc3RhdGUsIHJvdGF0ZUZpZ3VyZUxlZnQpLCBzdGF0ZSk7XG59O1xuZXhwb3J0IGNvbnN0IG1vdmVGaWVsZEZpZ3VyZSA9IChcbiAgICBjdHg6IFdpbmRvdyxcbiAgICB2ZWN0b3I6IFZlY3RvcjJELFxuICAgIHN0YXRlOiBGaWVsZFN0YXRlXG4pID0+IHtcbiAgICBhcHBseVRvRmlndWUoYmluZEFyZ3MoW2N0eCwgdmVjdG9yLCBzdGF0ZV0sIG1vdmVGaWd1cmUpLCBzdGF0ZSk7XG59O1xuXG5jb25zdCBjaGVrTGluZXMgPSAoY3R4OiBXaW5kb3csIHN0YXRlOiBGaWVsZFN0YXRlKSA9PiB7XG4gICAgY29uc3QgW2ZpZWxkXSA9IHN0YXRlO1xuICAgIGNvbnN0IFtnYW1lU3RhdGUsIHNjb3JlXSA9IGdldE9ic2VydmVycyhzdGF0ZSk7XG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBsaW5lU3VtID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBmaWVsZFtpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgbGluZVN1bSArPSBmaWVsZFtpXVtqXSA/IDEgOiAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lU3VtID09IGZpZWxkW2ldLmxlbmd0aCkge1xuICAgICAgICAgICAgbGluZXMucHVzaChpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWkgJiYgbGluZVN1bSkge1xuICAgICAgICAgICAgZ2FtZVN0YXRlKGJpbmRBcmcoR0FNRV9TVEFURV9FTkQsIHRyaWdnZXIpKTtcbiAgICAgICAgICAgIGN0eC5jbGVhclRpbWVvdXQoc3RhdGVbTE9PUF9JTkRFWF0pO1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgIHN0YXRlW1NDT1JFX0lOREVYXSArPSAxO1xuICAgICAgICBzY29yZShiaW5kQXJnKHN0YXRlW1NDT1JFX0lOREVYXSwgdHJpZ2dlcikpO1xuICAgICAgICBmb3IgKGxldCBpID0gbGluZTsgaSA+IDA7IGktLSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBmaWVsZFtpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGZpZWxkW2ldW2pdID0gZmllbGRbaSAtIDFdW2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5sZW5ndGg7XG59O1xuXG5jb25zdCBhbmltYXRlRmllbGQgPSAoY3R4OiBXaW5kb3csIHN0YXRlOiBGaWVsZFN0YXRlKSA9PiB7XG4gICAgY29uc3QgWywgLCBmaWd1cmVzXSA9IHN0YXRlO1xuICAgIG1vdmVGaWVsZEZpZ3VyZShjdHgsIFswLCAxXSwgc3RhdGUpO1xuICAgIHN0YXRlW0xPT1BfSU5ERVhdID0gY3R4LnNldFRpbWVvdXQoXG4gICAgICAgIGJpbmRBcmdzKFtjdHgsIHN0YXRlXSwgYW5pbWF0ZUZpZWxkKSxcbiAgICAgICAgMTAwMCAtIHN0YXRlW1NDT1JFX0lOREVYXSAqIDEwXG4gICAgKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlndXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZmlndXJlc1tpXShpc0ZpeGVkKSkge1xuICAgICAgICAgICAgd2hpbGUgKGNoZWtMaW5lcyhjdHgsIHN0YXRlKSkge31cbiAgICAgICAgICAgIGRlbGV0ZSBmaWd1cmVzW2ldO1xuICAgICAgICAgICAgZmlndXJlcy5sZW5ndGggPSBmaWd1cmVzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBhZGRGaWd1cmVSYW5kb21GaWd1cmUoY3R4LCBzdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdEZpZWxkID0gKFxuICAgIGN0eDogV2luZG93LFxuICAgIGJvYXJkU2l6ZTogVmVjdG9yMkQsXG4gICAgY29sbFNpemU6IFZlY3RvcjJEXG4pOiBGaWVsZEluc3RhbmNlID0+IHtcbiAgICBjb25zdCBbY29sbHVtcywgcm93c10gPSBib2FyZFNpemU7XG4gICAgY29uc3QgZmllbGQ6IEZpZWxkVHlwZSA9IFtdO1xuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHJvd3M7IHJvdysrKSB7XG4gICAgICAgIGNvbnN0IHJvd0FycmF5ID0gbmV3IGN0eC5BcnJheShjb2xsdW1zKS5maWxsKDApO1xuICAgICAgICBmaWVsZC5wdXNoKHJvd0FycmF5KTtcbiAgICB9XG4gICAgY29uc3QgZ2FtZU92ZXJPYnNlcnZlciA9IG9ic2VydmVyPG51bWJlciwgdm9pZD4oKTtcbiAgICBjb25zdCBzY29yZU9ic2VydmVyID0gb2JzZXJ2ZXI8bnVtYmVyPigpO1xuICAgIGNvbnN0IHN0YXRlOiBGaWVsZFN0YXRlID0gW1xuICAgICAgICBmaWVsZCxcbiAgICAgICAgY29sbFNpemUsXG4gICAgICAgIFtdIGFzIEZpZ3VyZUluc3RhbmNlW10sXG4gICAgICAgIDAsXG4gICAgICAgIFtnYW1lT3Zlck9ic2VydmVyLCBzY29yZU9ic2VydmVyXSxcbiAgICAgICAgMCxcbiAgICBdO1xuICAgIGFuaW1hdGVGaWVsZChjdHgsIHN0YXRlKTtcblxuICAgIHJldHVybiBjb250KHN0YXRlKTtcbn07XG5cbmV4cG9ydCBjb25zdCBhZGRGaWd1cmVSYW5kb21GaWd1cmUgPSAoY3R4OiBXaW5kb3csIHN0YXRlOiBGaWVsZFN0YXRlKSA9PiB7XG4gICAgY29uc3QgW2ZpZWxkLCAsIGZpZ3VyZXNdID0gc3RhdGU7XG4gICAgY29uc3QgW2dhbWVTdGF0ZV0gPSBnZXRPYnNlcnZlcnMoc3RhdGUpO1xuICAgIGdhbWVTdGF0ZShiaW5kQXJnKEdBTUVfU1RBVEVfUExBWSwgdHJpZ2dlcikpO1xuICAgIGlmIChmaWd1cmVzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpZ3VyZVNoYXBlSW5kZXggPSBjdHguTWF0aC5yb3VuZChcbiAgICAgICAgcmFuZG9tUmFuZ2UoY3R4LCAwLCBmdWxsRmlndXJlTGlzdC5sZW5ndGggLSAxKVxuICAgICk7XG4gICAgY29uc3QgY2VudGVyID0gY3R4Lk1hdGguZmxvb3IoZmllbGRbMF0ubGVuZ3RoIC8gMik7XG4gICAgY29uc3QgY2VudGVyUG9zaXRpb246IFZlY3RvcjJEID0gW2NlbnRlciAtIDIsIDBdO1xuICAgIGNvbnN0IGZpZ3VyZUluc3RhbmNlID0gZmlndXJlKGN0eCwgZmlndXJlU2hhcGVJbmRleCwgY2VudGVyUG9zaXRpb24pO1xuICAgIGZpZ3VyZXMucHVzaChmaWd1cmVJbnN0YW5jZSk7XG59O1xuXG5leHBvcnQgY29uc3QgZHJhd0ZpZWxkID0gKFxuICAgIGNhbnZhc0N0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICAgIGZpZWxkU3RhdGU6IEZpZWxkU3RhdGVcbikgPT4ge1xuICAgIGNvbnN0IG1hcmdpbiA9IDU7XG4gICAgY29uc3QgW2ZpZWxkLCBjZWxsU2l6ZSwgLCAsIGNvbG9yXSA9IGZpZWxkU3RhdGU7XG4gICAgY29uc3QgW3dpZHRoLCBoZWlnaHRdID0gY2VsbFNpemU7XG4gICAgY29uc3Qgcm93cyA9IGZpZWxkLmxlbmd0aDtcbiAgICBjb25zdCBjb2xscyA9IGZpZWxkWzBdLmxlbmd0aDtcbiAgICBjb25zdCBmdWxsSGVpZ2h0ID0gcm93cyAqIGhlaWdodDtcbiAgICBjb25zdCBmdWxsV2lkdGggPSBjb2xscyAqIHdpZHRoO1xuICAgIGNhbnZhc0N0eC5jbGVhclJlY3QoMCwgMCwgZnVsbFdpZHRoLCBmdWxsSGVpZ2h0KTtcbiAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCByb3dzOyByb3crKykge1xuICAgICAgICBjb25zdCB5ID0gaGVpZ2h0ICogcm93O1xuICAgICAgICBjYW52YXNDdHguZmlsbFJlY3QoMCwgeSAtIDEsIGZ1bGxXaWR0aCwgMik7XG4gICAgICAgIGZvciAobGV0IGNvbGwgPSAwOyBjb2xsIDwgY29sbHM7IGNvbGwrKykge1xuICAgICAgICAgICAgY29uc3QgeCA9IHdpZHRoICogY29sbDtcbiAgICAgICAgICAgIGlmICghcm93KSB7XG4gICAgICAgICAgICAgICAgY2FudmFzQ3R4LmZpbGxSZWN0KHggLSAxLCAwLCAyLCBmdWxsSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmaWVsZFtyb3ddW2NvbGxdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBmaWVsZFtyb3ddW2NvbGxdO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29sb3IgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzQ3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYW52YXNDdHguZmlsbFJlY3QoXG4gICAgICAgICAgICAgICAgICAgIHggKyBtYXJnaW4sXG4gICAgICAgICAgICAgICAgICAgIHkgKyBtYXJnaW4sXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoIC0gbWFyZ2luICogMixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0IC0gbWFyZ2luICogMlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY2FudmFzQ3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCAiaW1wb3J0IHsgYmluZEFyZywgYmluZEFyZ3MsIGZpbGxFbGVtV2lkaENhbnZhcywgb24gfSBmcm9tICdAbW9udGgvdXRpbHMnO1xuaW1wb3J0IHtcbiAgICBGaWVsZEluc3RhbmNlLFxuICAgIGRyYXdGaWVsZCxcbiAgICBhZGRGaWd1cmVSYW5kb21GaWd1cmUsXG4gICAgVmVjdG9yMkQsXG4gICAgaW5pdEZpZWxkLFxuICAgIG1vdmVGaWVsZEZpZ3VyZSxcbiAgICBnZXRPYnNlcnZlcnMsXG4gICAgR0FNRV9TVEFURV9QTEFZLFxuICAgIEdBTUVfU1RBVEVfRU5ELFxuICAgIHJvdGF0ZUZpZWxkRmlndXJlTGVmdCxcbn0gZnJvbSAnLi9maWVsZCc7XG5cbmNvbnN0IGRyYXcgPSAoXG4gICAgY3R4OiBXaW5kb3csXG4gICAgZmllbGRJbnN0YW5jZTogRmllbGRJbnN0YW5jZSxcbiAgICBjYW52YXNDdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRFxuKSA9PiB7XG4gICAgZmllbGRJbnN0YW5jZShiaW5kQXJnKGNhbnZhc0N0eCwgZHJhd0ZpZWxkKSk7XG4gICAgY3R4LnJlcXVlc3RBbmltYXRpb25GcmFtZShiaW5kQXJncyhbY3R4LCBmaWVsZEluc3RhbmNlLCBjYW52YXNDdHhdLCBkcmF3KSk7XG59O1xuXG50eXBlIEZpZWxkQWN0aW9uID0gKCkgPT4gYW55O1xudHlwZSBLZXlIYW5kbGVycyA9IFJlY29yZDxzdHJpbmcsIEZpZWxkQWN0aW9uPjtcblxuY29uc3QgZ2V0S2V5SGFuZGxlcnMgPSAoXG4gICAgY3R4OiBXaW5kb3csXG4gICAgZmllbGRJbnN0YW5jZTogRmllbGRJbnN0YW5jZVxuKTogS2V5SGFuZGxlcnMgPT4ge1xuICAgIGNvbnN0IGZpZ3VyZUJpbmQ6IEtleUhhbmRsZXJzID0ge1xuICAgICAgICBTcGFjZTogYmluZEFyZyhjdHgsIGFkZEZpZ3VyZVJhbmRvbUZpZ3VyZSkgYXMgYW55LFxuICAgICAgICBLZXlFOiByb3RhdGVGaWVsZEZpZ3VyZUxlZnQgYXMgYW55LFxuICAgICAgICAvLyBcIktleVdcIjogYmluZEFyZ3MoW2N0eCwgWzAsIC0xXV0sIG1vdmVGaWVsZEZpZ3VyZSksXG4gICAgICAgIEtleVM6IGJpbmRBcmdzKFtjdHgsIFswLCAxXV0sIG1vdmVGaWVsZEZpZ3VyZSksXG4gICAgICAgIEtleUE6IGJpbmRBcmdzKFtjdHgsIFstMSwgMF1dLCBtb3ZlRmllbGRGaWd1cmUpLFxuICAgICAgICBLZXlEOiBiaW5kQXJncyhbY3R4LCBbMSwgMF1dLCBtb3ZlRmllbGRGaWd1cmUpLFxuICAgIH07XG4gICAgZm9yIChsZXQga2V5IGluIGZpZ3VyZUJpbmQpIHtcbiAgICAgICAgZmlndXJlQmluZFtrZXldID0gYmluZEFyZyhmaWd1cmVCaW5kW2tleV0sIGZpZWxkSW5zdGFuY2UpO1xuICAgIH1cbiAgICByZXR1cm4gZmlndXJlQmluZDtcbn07XG5cbmNvbnN0IFNUQVJUX1RFWFQgPSAnUHJlc3MgU1BBQ0UgdG8gc3RhcnQnO1xuXG5jb25zdCBwaG9uZUNvbnRyb2xzTWFwOiBbc3RyaW5nLCBzdHJpbmddW10gPSBbXG4gICAgWydTcGFjZScsICdTdGFydCAoc3BhY2UpJ10sXG4gICAgWydLZXlFJywgJ1JvdGF0ZSAoRSknXSxcbiAgICBbJ0tleUEnLCAnTGVmdCAoQSknXSxcbiAgICBbJ0tleVMnLCAnRG93biAoUyknXSxcbiAgICBbJ0tleUQnLCAnUmlnaHQgKEQpJ10sXG5dO1xuY29uc3QgaW5saW5lQmxvY2sgPSB7XG4gICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgbWFyZ2luOiAnNXB4Jyxcbn07XG5jb25zdCBibG9jayA9IHtcbiAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgIG1hcmdpbjogJzVweCBhdXRvJyxcbn07XG5jb25zdCBzbWFsbEJ1dHRvbiA9IHtcbiAgICBwYWRkaW5nOiAnNXB4JyxcbiAgICB0b3VjaEFjdGlvbjogJ21hbmlwdWxhdGlvbicsXG59O1xuY29uc3QgcGhvbmVTdHlsZU1hcCA9IChjdHg6IFdpbmRvdyk6IFJlY29yZDxzdHJpbmcsIGFueT4gPT4gKHtcbiAgICBTcGFjZTogY3R4Lk9iamVjdC5hc3NpZ24oe30sIHNtYWxsQnV0dG9uLCBibG9jayksXG4gICAgS2V5RTogY3R4Lk9iamVjdC5hc3NpZ24oe30sIHNtYWxsQnV0dG9uLCBibG9jayksXG4gICAgS2V5UzogY3R4Lk9iamVjdC5hc3NpZ24oe30sIGlubGluZUJsb2NrLCBzbWFsbEJ1dHRvbiksXG4gICAgS2V5QTogY3R4Lk9iamVjdC5hc3NpZ24oe30sIGlubGluZUJsb2NrLCBzbWFsbEJ1dHRvbiksXG4gICAgS2V5RDogY3R4Lk9iamVjdC5hc3NpZ24oe30sIGlubGluZUJsb2NrLCBzbWFsbEJ1dHRvbiksXG59KTtcblxuY29uc3QgYWRkUGhvbmVDb250cm9scyA9IChcbiAgICBjdHg6IFdpbmRvdyxcbiAgICBlbGVtZW50OiBIVE1MRGl2RWxlbWVudCxcbiAgICBrZXlIYW5kbGVyczogS2V5SGFuZGxlcnNcbikgPT4ge1xuICAgIGNvbnN0IGNvbnRyb2xzID0gY3R4LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGN0eC5PYmplY3QuYXNzaWduKGVsZW1lbnQuc3R5bGUsIHtcbiAgICAgICAgbWFyZ2luQm90dG9tOiAnMjAwcHgnLFxuICAgIH0pO1xuICAgIGN0eC5PYmplY3QuYXNzaWduKGNvbnRyb2xzLnN0eWxlLCB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICB0b3A6ICcxMDAlJyxcbiAgICAgICAgbGVmdDogJzAnLFxuICAgICAgICByaWdodDogJzAnLFxuICAgIH0pO1xuICAgIGNvbnN0IHN0eWxlcyA9IHBob25lU3R5bGVNYXAoY3R4KTtcbiAgICBwaG9uZUNvbnRyb2xzTWFwLmZvckVhY2goKFtrZXksIG5hbWVdKSA9PiB7XG4gICAgICAgIGNvbnN0IGVsZW0gPSBjdHguZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGVsZW0uaW5uZXJUZXh0ID0gbmFtZTtcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBzdHlsZXNba2V5XTtcbiAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICBjdHguT2JqZWN0LmFzc2lnbihlbGVtLnN0eWxlLCBzdHlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGtleUhhbmRsZXJzW2tleV0sIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgY29udHJvbHMuYXBwZW5kQ2hpbGQoZWxlbSk7XG4gICAgfSk7XG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChjb250cm9scyk7XG59O1xuXG5jb25zdCBpbml0Q2FudmFzID0gKGN0eDogV2luZG93LCBlbGVtZW50OiBFbGVtZW50KSA9PiB7XG4gICAgY29uc3QgaHRtbEVsZW1lbnQgPSBlbGVtZW50IGFzIEhUTUxEaXZFbGVtZW50O1xuICAgIGh0bWxFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgIGNvbnN0IGJvYXJkU2l6ZTogVmVjdG9yMkQgPSBbMTAsIDIwXTtcbiAgICBjdHguT2JqZWN0LmFzc2lnbihodG1sRWxlbWVudC5zdHlsZSwge1xuICAgICAgICBoZWlnaHQ6ICc0MDBweCcsXG4gICAgICAgIHdpZHRoOiAnMjAwcHgnLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgIG1hcmdpbjogJzQwcHggYXV0byAwJyxcbiAgICB9KTtcbiAgICBjb25zdCBpbmZvID0gY3R4LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGN0eC5PYmplY3QuYXNzaWduKGluZm8uc3R5bGUsIHtcbiAgICAgICAgbGVmdDogJzAnLFxuICAgICAgICByaWdodDogJzAnLFxuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgdG9wOiAnLTMwcHgnLFxuICAgIH0pO1xuICAgIGluZm8uaW5uZXJUZXh0ID0gU1RBUlRfVEVYVDtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGluZm8pO1xuICAgIGNvbnN0IFtyZWN0LCBjYW52YXNdID0gZmlsbEVsZW1XaWRoQ2FudmFzKGN0eCwgaHRtbEVsZW1lbnQpO1xuICAgIHZhciBjYW52YXNDdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBpZiAoIWNhbnZhc0N0eCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IFtjb2xsdW1zLCByb3dzXSA9IGJvYXJkU2l6ZTtcbiAgICBjb25zdCBjb2xsSGVpZ2h0ID0gcmVjdC5oZWlnaHQgLyByb3dzO1xuICAgIGNvbnN0IGNvbGxXaWR0aCA9IHJlY3Qud2lkdGggLyBjb2xsdW1zO1xuICAgIGNvbnN0IGNvbGxTaXplOiBWZWN0b3IyRCA9IFtjb2xsV2lkdGgsIGNvbGxIZWlnaHRdO1xuICAgIGNvbnN0IGZpZWxkSW5zdGFuY2UgPSBpbml0RmllbGQoY3R4LCBib2FyZFNpemUsIGNvbGxTaXplKTtcbiAgICBjb25zdCBrZXlIYW5kbGVycyA9IGdldEtleUhhbmRsZXJzKGN0eCwgZmllbGRJbnN0YW5jZSk7XG4gICAgYWRkUGhvbmVDb250cm9scyhjdHgsIGVsZW1lbnQgYXMgSFRNTERpdkVsZW1lbnQsIGtleUhhbmRsZXJzKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgICAgaWYgKGtleUhhbmRsZXJzW2UuY29kZV0pIHtcbiAgICAgICAgICAgIGtleUhhbmRsZXJzW2UuY29kZV0oKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IFtnYW1lU3RhdGUsIHNjb3JlXSA9IGZpZWxkSW5zdGFuY2UoZ2V0T2JzZXJ2ZXJzKTtcbiAgICBnYW1lU3RhdGUoXG4gICAgICAgIGJpbmRBcmcoKHN0YXRlOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR0FNRV9TVEFURV9QTEFZICYmIGluZm8uaW5uZXJUZXh0ID09IFNUQVJUX1RFWFQpIHtcbiAgICAgICAgICAgICAgICBpbmZvLmlubmVyVGV4dCA9ICcnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gR0FNRV9TVEFURV9FTkQpIHtcbiAgICAgICAgICAgICAgICBpbmZvLmlubmVyVGV4dCA9ICdHYW1lIE92ZXInO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBvbilcbiAgICApO1xuICAgIHNjb3JlKFxuICAgICAgICBiaW5kQXJnKChubzogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBpbmZvLmlubmVyVGV4dCA9IGBZb3VyIHNjb3JlICR7bm99YDtcbiAgICAgICAgfSwgb24pXG4gICAgKTtcbiAgICBkcmF3KGN0eCwgZmllbGRJbnN0YW5jZSwgY2FudmFzQ3R4KTtcbn07XG5cbmV4cG9ydCBjb25zdCBpbml0VGV0cmlzRWZmZWN0ID0gKGN0eDogV2luZG93KSA9PiB7XG4gICAgY29uc3QgdGFncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy10ZXRyaXMnKTtcbiAgICBjdHguQXJyYXkuZnJvbSh0YWdzKS5mb3JFYWNoKGJpbmRBcmcoY3R4LCBpbml0Q2FudmFzKSk7XG59O1xuIiwgImltcG9ydCB7IGluaXRTbm93Zmxha2VFZmZlY3QgfSBmcm9tICdAbW9udGgvc25vd2ZsYWtlJztcbmltcG9ydCB7IGluaXRUZXRyaXNFZmZlY3QgfSBmcm9tICdAbW9udGgvdGV0cmlzJztcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgLy8gaW5pdFNub3dmbGFrZUVmZmVjdCh3aW5kb3cpO1xuICAgIGluaXRUZXRyaXNFZmZlY3Qod2luZG93KTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFBTyxNQUFNLFdBQVcsQ0FBQyxZQUFtQixPQUFpQjtBQUN6RCxXQUFPLElBQUksU0FBZ0I7QUFDdkIsYUFBTyxHQUFHLE1BQU0sTUFBTSxXQUFXLE9BQU87QUFBQTtBQUFBO0FBSXpDLE1BQU0sVUFBVSxDQUNuQixLQUNBLE9BQ2tDO0FBQ2xDLFdBQU8sU0FBUyxDQUFDLE1BQU07QUFBQTs7O0FDRnBCLE1BQU0sY0FBYyxDQUFDLEtBQWEsS0FBYSxRQUFnQjtBQUNsRSxXQUFPLE1BQU0sSUFBSSxLQUFLLFdBQVksT0FBTTtBQUFBOzs7QUNGckMsTUFBTSxxQkFBcUIsQ0FDOUIsS0FDQSxZQUMrQjtBQUMvQixVQUFNLFNBQVMsSUFBSSxTQUFTLGNBQWM7QUFDMUMsUUFBSSxPQUFPLE9BQU8sT0FBTyxPQUFPO0FBQUEsTUFDNUIsVUFBVTtBQUFBLE1BQ1YsS0FBSztBQUFBLE1BQ0ws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
