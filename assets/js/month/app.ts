import { 
  DOMStruct,
  domCreator,
  genAttr,
  genClass,
  genProp,
  genRef,
  genTagDiv,
  genTagName,
  genText,
  randomRange 
} from "@month/utils";

const DATA_ATTRIBUTE = 'data-month';

const cleanHtml = (root: HTMLElement) => {
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
}
const CONTROL_BUTTON: Partial<CSSStyleDeclaration> = {
  margin: '20px 0',
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
}

const render = (ctx: Window, monthNames: Record<string, string>, root: HTMLElement) => {
  const answer = Math.round(randomRange(ctx, 1, 12));
  let headerRefer: HTMLElement | undefined;

  const next = (e: MouseEvent) => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.getAttribute(DATA_ATTRIBUTE) === String(answer)) {
      target.style.backgroundColor = 'green';
      if (headerRefer) {
        headerRefer.innerHTML = `Правильно!`;
      }
      ctx.setTimeout(() => {
        cleanHtml(root);
        render(ctx, monthNames, root);
      }, 500);
    } else {
      target.style.backgroundColor = 'red';
    }
    target.removeEventListener('click', next);
  }

  const out = [
    genTagDiv([
      genRef(),
      genProp('style', {
        fontSize: '30px',
        margin: '20px 0',
      }),
      genText(monthNames[answer])
    ]),
    genTagDiv([
      genClass('options')
    ], Array.from({length: 12}).map((_,i) => {
      const monthNo = i + 1;
      return genTagName(
        'button', [
          genText(monthNo),
          genProp('style', {
            width: '20%',
            height: '50px',
            margin: '5%',
          }),
          genAttr(DATA_ATTRIBUTE, monthNo),
          genProp('onclick', next)
      ]);
    })),
  ];
  ([headerRefer] = domCreator(ctx, root, out));
}

export const init = (ctx: Window, root: HTMLElement) => {
  const baseHTML: HTMLElement[] = Array.from(root.children) as HTMLElement[];
  const monthNames: Record<string, string> = {};
  Object.assign(root.style, {
    minHeight: '70vh',
  });
  
  for (const parentElem of baseHTML) {
    if (!parentElem.classList.contains('month')) {
      continue;
    }
    for (const childElem of parentElem.children) {
      if (childElem.nodeType === Node.ELEMENT_NODE && 'innerText' in childElem) {
        const [no, name] = String(childElem.innerText).split(' ');
        if (Number.isNaN(parseInt(no))) {
          continue;
        }
        monthNames[no] = name;
      }
    }
  }

  const back = (e: MouseEvent) => {
    cleanHtml(root);
    e.target?.removeEventListener('click', back);
    baseHTML.forEach((elem) => {
      root.appendChild(elem);
    });
  };

  const backButton = genTagName(
    'button', [
      genProp('style', CONTROL_BUTTON),
      genProp('onclick', back),
      genText('Выйти из тренажера')
  ]);

  const runButtonTemplate = genTagName(
    'button', [
      genRef(),
      genProp('style', CONTROL_BUTTON),
      genText('Запустить тренажер'),
      genProp('onclick', () => {
        cleanHtml(root);
        const template = genTagDiv([genClass('month-game')], [
          genTagName('h3', [
            genText('Тренажер запоминания месяцов')
          ]),
          genTagDiv([
            genProp('style', {
              maxWidth: '500px',
              margin: '0 auto',
            }),
            genRef()
          ]),
          backButton
        ]);
        const [renderRoot] = domCreator(ctx, root, template);
        render(ctx, monthNames, renderRoot);
      })
  ]);

  const [button] = domCreator(
    ctx, root, runButtonTemplate
  );
  
  baseHTML.push(button);
}
