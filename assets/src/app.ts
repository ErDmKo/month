import { initSnowflakeEffect } from "./snowflake";
import { initTetrisEffect } from "./tetris/tetris";

window.addEventListener('load', () => {
   // initSnowflakeEffect(window);
   initTetrisEffect(window);
});