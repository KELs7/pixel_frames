import { default as global } from './global-object-polyfill';
import * as sapper from '@sapper/app';


sapper.start({
	target: document.querySelector('#sapper')
});