import { initSnowflakeEffect } from '@month/snowflake';
import { initTetrisEffect } from '@month/tetris';
import { initTennisEffect } from '@month/tennis';

window.addEventListener('load', () => {
    // initSnowflakeEffect(window);
    initTetrisEffect(window);
    initTennisEffect(window);
});
