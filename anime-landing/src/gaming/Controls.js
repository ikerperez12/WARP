export class Controls {
    constructor() {
        this.state = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            boost: false,
            reset: false
        };

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.state.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.state.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.state.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.state.right = true;
                break;
            case 'Space':
                this.state.boost = true;
                break;
            case 'KeyR':
                this.state.reset = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.state.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.state.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.state.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.state.right = false;
                break;
            case 'Space':
                this.state.boost = false;
                break;
            case 'KeyR':
                this.state.reset = false;
                break;
        }
    }

    getState() {
        return this.state;
    }
}
