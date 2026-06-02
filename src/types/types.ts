export type AsyncResultData<T> = {
	success: true;
	data: T;
}

export type AsyncResultMsg = {
	success: boolean;
	message: string;
}