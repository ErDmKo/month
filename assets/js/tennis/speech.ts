import { bindArg, observer, trigger } from "@month/utils";
import { Sides, TEAM_LEFT, TEAM_RIGHT } from "./const";

const prefixes = ['webkit', 'moz', 'ms', 'o'];

const getConstructors = (winCtx: Window) => {
  const ctx = winCtx as any;
  const result = [];
  for (const prefix of prefixes) {
    const grammarKey = `${prefix}SpeechGrammarList`;
    const speechKey = `${prefix}SpeechRecognition`;
    if (!result[0] && ctx[grammarKey]) {
       result[0] = ctx[grammarKey];
    }
    if (ctx[speechKey]) {
       result[1] = ctx[speechKey];
    }
    if (result.length == 2) {
      break;
    }
  }
  return result;
}
// const grammarStr = "#JSGF V1.0; grammar sides; public <side> = left | right | stop;"

export const LOG_TYPE = 0 as const;
export const COMMAND_TYPE = 1 as const;

export type Commands = 
  | [typeof COMMAND_TYPE, Sides[keyof Sides]]
  | [typeof LOG_TYPE, string];

const WORDS_TO_COMMANDS: Record<string, Commands | undefined> = {
  ['yellow']: [COMMAND_TYPE, TEAM_LEFT],
  ['right']: [COMMAND_TYPE, TEAM_RIGHT],
}

const STOP_COMMAND = 'stop';

export const startListen = (ctx: Window) => {
  const observerObj = observer<Commands, void>();
  const [grammar, speech] = getConstructors(ctx);
  if (!speech || !grammar) {
    try {
      return observerObj;
    } finally {
      observerObj(bindArg(
        [LOG_TYPE, 'SpeechRecognition is not supported']
      , trigger));
    }
  }
  const recognition = new speech();
  //const speechRecognitionList = new grammar();
  // recognition.grammars = speechRecognitionList;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;
  recognition.start();
  let isStopped = false;

  recognition.onresult = (event: any) => {
    const { results, resultIndex } = event;
    const { transcript } = results[resultIndex][0];
    observerObj(bindArg(
      [LOG_TYPE, transcript]
    , trigger));
    transcript.split(' ').forEach((rawWord: string) => {
      const word = rawWord.toLowerCase().trim();
      if (WORDS_TO_COMMANDS.hasOwnProperty(word)) {
        const command = WORDS_TO_COMMANDS[word] as Commands;
        observerObj(bindArg(command, trigger));
      }
      if (word === STOP_COMMAND) {
        isStopped = true;
        recognition.stop();
      }
    });
  };

  recognition.onerror = (e: {message: string}) => {
    observerObj(bindArg(
      [LOG_TYPE, e.message]
    , trigger));
  };
  recognition.onend = () => {
    if (!isStopped) {
      recognition.start();
    }
  }
  return observerObj;
}
