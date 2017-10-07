export default class GraphCanvas {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.pixelRatio = 1.0;

        this.canvasContext = this.canvas.getContext('2d');
    }

    setGraph(graph) {
        this.graph = graph;

        this.outsideNodes = [];
        for (const e of this.graph.nodeList[0].freeAngleEdges) {
            this.outsideNodes.push(e.n2);
        }

        this.outsideNodes[0].setPos(0, -100);
        this.outsideNodes[1].setPos(100, -150);
        this.outsideNodes[2].setPos(100, -150);
    }

    draw(ctx) {
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        for (const e of this.graph.edgeList) {
            e.draw(ctx);
        }
        for (const n of this.graph.nodeList) {
            n.draw(ctx);
        }
    }

    // https://stackoverflow.com/questions/37135417/download-canvas-as-png-in-fabric-js-giving-network-error
    dataURLtoBlob (dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    saveImage (gl, width, height, filename) {
        const data = new Uint8Array(width * height * 4);
        const type = gl.UNSIGNED_BYTE;
        gl.readPixels(0, 0, width, height, gl.RGBA, type, data);

        const saveCanvas = document.createElement('canvas');
        saveCanvas.width = width;
        saveCanvas.height = height;
        const context = saveCanvas.getContext('2d');

        const imageData = context.createImageData(width, height);
        imageData.data.set(data);
        context.putImageData(imageData, 0, 0);
        const a = document.createElement('a');
        const canvasData = saveCanvas.toDataURL();
        const blob = this.dataURLtoBlob(canvasData);

        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    }
}
