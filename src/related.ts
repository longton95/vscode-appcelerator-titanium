import * as path from 'path';
import * as _ from 'underscore';
import { getAlloyRootPath, isAlloyProject } from './utils';

import { Uri, window, TextEditor, TextDocument, workspace } from 'vscode';

const alloyDirectoryMap: { [key: string]: string } = {
	xml: 'views',
	tss: 'styles',
	js: 'controllers'
};

/**
 * Get path of related file
 *
 * @param {String} type 			view, style, controller
 * @param {String} currentFilePath	path of current file
 * @returns {String}
 */
export function getTargetPath (type: string, currentFilePath?: string): string|undefined {
	if (!currentFilePath) {
		currentFilePath = window.activeTextEditor?.document.fileName;
	}

	if (!currentFilePath || currentFilePath.indexOf(getAlloyRootPath()) === -1) {
		return;
	}

	const pathUnderAlloy = path.relative(getAlloyRootPath(), currentFilePath);
	const pathSplitArr = pathUnderAlloy.split(path.sep);

	if (pathSplitArr[0] === 'widgets') {
		pathSplitArr[2] = alloyDirectoryMap[type];  // change type
	} else {
		pathSplitArr[0] = alloyDirectoryMap[type];  // change type
	}

	const fileSplitArr = pathSplitArr[pathSplitArr.length - 1].split('.');
	fileSplitArr[fileSplitArr.length - 1] = type; // change ext

	const targetPath = path.resolve(getAlloyRootPath(), pathSplitArr.join(path.sep), '..', fileSplitArr.join('.'));
	return targetPath;
}

/**
 * Open related file
 *
 * @param {String} type 	view, style, controller
 * @returns {Thenable}
 */
export function openRelatedFile (type: string): Thenable<TextEditor>|undefined {
	if (!window.activeTextEditor) {
		return;
	}
	const relatedPath = getTargetPath(type);
	if (!relatedPath) {
		return;
	}
	if (!window.visibleTextEditors.find(editor => editor.document.fileName === relatedPath)) {
		return window.showTextDocument(Uri.file(relatedPath), { preview: false });
	}
}

/**
 * Open related files
 */
export async function openAllFiles (): Promise<void> {

	[ 'xml', 'tss', 'js' ].forEach(type => {
		openRelatedFile(type);
	});
}

/**
 * Open or close related files
 */
export async function  toggleAllRelatedFiles (): Promise<void> {
	if (!window.activeTextEditor) {
		return;
	}

	openAllFiles();

}

/**
 * Open related file
 *
 * @param {String} uri 	uri for document on disk
 * @param {boolean} openTextDocument  Open file on vscode
 * @returns {Promise<TextDocument>}
 */
export async function openTextDocument(uri: string, openTextDocument?: boolean): Promise<string> {

	const document = await (await workspace.openTextDocument(uri)).getText();

	if (openTextDocument && !window.visibleTextEditors.find(editor => editor.document.fileName === uri)) {
		window.showTextDocument(Uri.file(uri), { preview: false });
	}

	return document;
}
