const Busboy = require("busboy")
const {logger, pipelineAsync} = require("./util")
const {join} = require("path")


class UploadHandler {
    #socketId
    #io


    constructor(io, socketId) {
        this.#socketId = socketId 
        this.#io = io

    }

    regisgterEvents(headers, onFinish) {
        const busboy = new Busboy({headers})

        busboy.on("file", this.#onFile.bind(this))

        busboy.on("finish", onFinish)

        return busboy
    }

    #handleFileBytes(filename) {
        async function * handleData(data) {
            for await (const item of data) {
                const size = item.length
                logger.info(`File [${filename}] got ${size} bytes to ${this.#socketId}`)
                yield item
            }
        }
    }

    async #onFile (fieldname, file, filename)  {
        const saveFileTo = join(__dirname, "../", "downloads", filename)
        logger.info("Uploading " + saveFileTo)

        await pipelineAsync(
            file,
            this.#handleFileBytes.apply()
        )
    }
}

module.exports = UploadHandler
