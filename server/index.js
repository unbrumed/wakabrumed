const http = require("http");

const callbacks = {
	echo: (body, response) => {
		//response.writeHead(200, {'Content-Type': 'application/json'})
		response.end(body);
	}
}

const cache_callbacks = {};

function register_callback(method, path, callback) {
	cache_callbacks[method] = cache_callbacks[method] || {};
	cache_callbacks[method][path] = callback;
}

function sendresponse(body, response, request) {
	const { method, url } = request;
	console.log(`serving ${method} method on ${url} url`);

	if (!cache_callbacks[method] || !cache_callbacks[method][url]) {
		response.statusCode = 404;
		response.end(`no callback for ${method} ${url}.`);
		console.error(`no such callback`);

		return;
	}

	cache_callbacks[method][url](body, response, request);
}

function onrequest(request, response) {
	const { headers, method, url } = request;
	let body = [];
	response.on('error', (err) => {
		console.error(err);
	});
	request.on('error', (err) => {
		console.error(err);
		response.statusCode = 400;
		response.end();
	}).on('data', (chunk) => {
		body.push(chunk);
	}).on('end', () => {
		body = Buffer.concat(body).toString();

		response.on('error', (err) => {
			console.error(err);
		});
		sendresponse(body, response, request);
	});
}

function serve() {
	const PORT = 8888;
	const server = http.createServer();
	server.on('request', onrequest);
	server.listen(8888);
	console.log(`listen on ${8888}`);
}
function main() {
	serve();
	register_callback('POST', '/echo', callbacks.echo);
}

main();
