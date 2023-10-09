export type Json = string | number | boolean | { [x: string]: Json } | Array<Json>;

export interface SseEvent {
	id?: string;
	event?: string;
	data?: Json;
}

export interface SseEvents {
	[key: string]: (...data: any) => void;
}
