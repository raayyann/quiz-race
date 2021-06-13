const socket = io();

const enterName = () => {
    swal({
        title: "Masukan Nama Anda",
        content: "input",
        button: {
            text: "Masuk",
            closeModal: false,
        },
    }).then((name) => {
        if (!name || !name.trim()) return enterName();
        socket.emit("name", name);
        swal.close();
    });
};
enterName();

const start = document.querySelector("#start");
const room = document.querySelector("#room");
const game = document.querySelector("#game");

const switchPage = (id) => {
    start.style.display = "none";
    room.style.display = "none";
    game.style.display = "none";
    document.querySelector("#" + id).style.display = "block";
};

// Start
const joinRoom = document.querySelector("#join-room");
const roomNameInput = document.querySelector("#room-name-input");

// Room
const roomName = document.querySelector("#room-name");
const startGame = document.querySelector("#start-game");
const playerList = document.querySelector("#player-list");

// Game
const quizTitle = document.querySelector("#quiz-title");
const quizDescription = document.querySelector("#quiz-description");
const question = document.querySelector("#question");
const answerForm = document.querySelector("#answer-form");
const answerBox = document.querySelector("#answer-box");
const correctSound = document.querySelector("#correct-sound");
const incorrectSound = document.querySelector("#incorrect-sound");
const playersProgress = document.querySelector("#players-progress");

// Chat
const chatList = document.querySelector("#chat-list");
const chatForm = document.querySelector("#chat-form");
const chatMsg = document.querySelector("#chat-msg");

// Event Listener

// Start
joinRoom.addEventListener("click", () => {
    if (!roomNameInput.value.trim()) return;
    joinRoom.style.display = "none";
    roomName.textContent = "Room - " + roomNameInput.value;
    socket.emit("joinRoom", roomNameInput.value);
});

// Room
startGame.addEventListener("click", () => {
    startGame.style.display = "none";
    socket.emit("start");
});

// Game
answerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    socket.emit("answer", answerBox.value);
    answerBox.value = "";
});

// Chat
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    socket.emit("chat", chatMsg.value);
    chatMsg.value = "";
});

// Socket.io Event Listener

socket.on("joinedRoom", (data) => {
    switchPage("room");
    if (data === "owner") {
        startGame.style.display = "block";
    }
});

socket.on("joinError", (data) => {
    swal({
        title: "Tidak bisa join room",
        text: data,
    });
    joinRoom.style.display = "block";
});

socket.on("startError", (data) => {
    swal({
        title: "Tidak bisa memulai game",
        text: data,
    });
    startGame.style.display = "block";
});

socket.on("updateUser", (data) => {
    playerList.innerHTML = "";
    data.forEach((pName) => {
        let player = document.createElement("li");
        playerList.appendChild(player);
        player.outerHTML = `<li class="list-group-item">${pName}</li>`;
    });
});

socket.on("start", () => {
    switchPage("game");
});

socket.on("quizData", (data) => {
    quizTitle.textContent = data.name;
    quizDescription.textContent = data.description;
});

socket.on("updateQuestion", (data) => {
    question.textContent = data;
});

socket.on("answer", (data) => {
    if (data) {
        correctSound.play();
    } else {
        incorrectSound.play();
    }
});

socket.on("updatePlayersProgress", (data) => {
    playersProgress.innerHTML = "";
    Object.entries(data).forEach((p) => {
        let player = document.createElement("li");
        playersProgress.appendChild(player);
        player.outerHTML = `<li class="list-group-item">
                                ${p[0]}
                                <div class="progress mt-1">
                                    <div
                                        class="progress-bar"
                                        role="progressbar"
                                        style="width: ${(p[1] / 20) * 100}%"
                                    >
                                        ${p[1]}
                                    </div>
                                </div>
                            </li>`;
    });
});

socket.on("chat", (data) => {
    let chat = document.querySelector("div");
    chatList.appendChild(chat);
    chat.outerHTML = `<div class="card mb-2 text-dark">
                        <div class="card-body">
                            <h5 class="card-title">${data[0]}</h5>
                            <p class="card-text">${data[1]}</p>
                        </div>
                    </div>`;
});

socket.on("dc", () => {});

socket.on("end", (data) => {
    socket.disconnect();
    swal({
        title: "Permainan Berakhir",
        text: `Permainan dimenangkan oleh ${data}`,
    }).then(() => {
        window.location.reload();
    });
});
