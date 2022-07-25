import { Injectable } from "@nestjs/common";
import * as http from "http";
import * as url from "url";
import path from "path";
import * as fs from 'fs';
import FormData from "form-data";
import { SeaweedFSError } from "./dto/seaweedfs.dto";
const qs = require('querystring');
const baseURL = 'http://' + process.env.SEAWEEDFS_HOST + ':' + process.env.SEAWEEDFS_PORT;

@Injectable()
export class SeaweedfsService {
    constructor() { }

    async _assign(opts: any): Promise<any> {
        return new Promise(function (resolve, reject) {
            var req = http.get(baseURL +  "localrepo?" + qs.stringify(opts), res => {
                let body = [];
                let err;
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    body.push(chunk)
                });
                res.on('end', function () {
                    var json = JSON.parse(JSON.stringify(body));
                    if (json.error) {
                        var err = this.SeaweedFSError(json.error);
                        err.volumeId = json.volumeId;
                        return reject(err);
                    } else {
                        return resolve(json);
                    }
                });
            });
            req.on("error", function (err) {
                return reject(err);
            });
            req.end();
        });
    }

    async write(file: any): Promise<any> {
        var opts = opts || {};
        var self = this;
        if (file instanceof Array) {
            opts.count = file.length;
            for (var i = 0; i < opts.count; i++) {
                if (typeof file[i] === "string") {
                    file[i] = path.resolve(process.cwd(), file[i]);
                }
            }
        } else {
            opts.count = 1
            if (typeof file === "string") {
                file = path.resolve(process.cwd(), file);
            }
            file = [file];
        }

        let assignOpts = Object.assign({}, opts);
        delete assignOpts.headers;
        return self._assign(assignOpts).then(function (finfo) {
            if (finfo.error) {
                return Promise.reject(finfo.error);
            }

            var proms = [];
            for (var i = 0; i < opts.count; i++) {
                proms.push(new Promise(function (resolve, reject) {
                    var form = new FormData();
                    var stream = typeof file[i] === "string" ? fs.createReadStream(file[i]) : null;
                    form.append("file", stream ? stream : file[i]);

                    var urlParts = url.parse(baseURL + "localrepo/" + (opts.count == 1 ? "" : "_" + i));
                    var options = Object.assign({}, urlParts);
                    if (opts.headers) {
                        options = opts.headers;
                    }

                    var req = form.submit(urlParts.toString(), function (err, res) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(res);
                    });

                    if (stream) {
                        stream.on("error", function (err) {
                            reject(err);
                        });
                    }

                    req.on("error", function (err) {
                        reject(err);
                    });

                    req.on("socket", function (socket) {
                        socket.on("error", function (err) {
                            reject(err);
                        });
                    })
                }));
            }

            return Promise.all(proms).then(function () {
                return Promise.resolve(finfo);
            });

        });
    }

    async find(path: string): Promise<any> {
        return new Promise(function (resolve, reject) {
            var req = http.get(baseURL + path, res => {
                let body = [];
                let err;
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    body.push(chunk)
                });
                res.on('end', function () {
                    var json = JSON.parse(JSON.stringify(body));
                    if (json.error) {
                        var err = this.SeaweedFSError(json.error);
                        err.volumeId = json.volumeId;
                        return reject(err);
                    } else {
                        return resolve(json);
                    }
                });
            });
            req.on("error", function (err) {
                return reject(err);
            });
            req.end();
        });
    }

    async read(path: string): Promise<any> {
        var data_find = await this.find(path);
        if (data_find.length > 0) {
            return new Promise(function (resolve, reject) {
                var req = http.request(baseURL + path, res => {
                    let body = [];

                    res.on('data', function (chunk) {
                        body.push(chunk)
                    });
                    res.on('end', function () {
                        return resolve(Buffer.concat(body));
                    });
                });
                req.on("error", function (err) {
                    return reject(err);
                });
                req.end();
            });
        } else {
            return null;
        }
    }

    async remove(fid: string, opts: any): Promise<any> {
        return await this.find(fid).then(function (result) {
            return new Promise(function (resolve, reject) {
                var proms = [];
                for (var i = 0, len = result.locations.length; i < len; i++) {
                    proms.push(new Promise(function (resolve, reject) {
                        var req = http.request(Object.assign(url.parse("http://" + baseURL + "/" + fid), {
                            "method": "DELETE"
                        }), function (res) {
                            if (res.statusCode === 404) {
                                var err = this.SeaweedFSError("file '" + fid + "' not found");
                                return reject(err);
                            }
                            var tmp = [];
                            res.on("data", function (chunk) {
                                tmp.push(chunk);
                            });
                            res.on("end", function () {
                                var buffer = Buffer.concat(tmp);
                                var payload = JSON.parse(buffer.toString("utf-8"));

                                if (!payload.size) {
                                    return reject(this.SeaweedFSError("File with fid " + fid + " could not be removed"));
                                }
                                resolve(payload);
                            });
                        });
                        req.on("error", function (err) {
                            reject(err);
                        });
                        req.end();
                    }));
                }
                Promise.all(proms).then(function () {
                    resolve({
                        count: result.locations.length
                    });
                }).catch(function (err) {
                    reject(err);
                });
            });
        });
    }

    async SeaweedFSError(message) {
        var SeaweedFSError_ = new SeaweedFSError();
        SeaweedFSError_.name = 'SeaweedFSError';
        SeaweedFSError_.message = message || 'Communication with SeaweedFS failed';
        SeaweedFSError_.stack = (new Error()).stack;
    }
}