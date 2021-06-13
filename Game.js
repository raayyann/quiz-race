const { QuizList } = require("./QuizList.json");

class Game {
    constructor(players) {
        this.players = players;
        this.quiz = this.getRandomQuiz();
        this.players.forEach((p, i) => {
            p.emit("quizData", this.quiz.data);
            p.question = 1;
            p.emit("updateQuestion", `(1) ${this.quiz.questions[0].question}`);
            p.on("answer", (ans) => {
                this.answer(p, ans);
            });
            p.on("chat", (msg) => {
                this.emitAllPlayer("chat", [p.name, this.htmlEncode(msg)]);
            });
            p.on("disconnect", () => {
                this.players.splice(i, 1);
                this.updatePlayersProgress();
                this.emitAllPlayer("chat", [
                    "INFO",
                    `${p.name} terputus dari server`,
                ]);
            });
        });
        this.updatePlayersProgress();
    }

    emitAllPlayer(e, d) {
        this.players.forEach((p) => {
            p.emit(e, d);
        });
    }

    htmlEncode(s) {
        return s.replace(/[\u00A0-\u9999<>\&]/gim, (i) => {
            return "&#" + i.charCodeAt(0) + ";";
        });
    }

    getRandomQuiz() {
        let quiz = QuizList[Math.floor(Math.random() * QuizList.length)];
        quiz.questions.sort(() => Math.random() - 0.5);
        return quiz;
    }

    updateQuestion(p, q) {
        if (q > 20) {
            return this.emitAllPlayer("end", p.name);
        }
        p.question = q;
        p.emit(
            "updateQuestion",
            `(${q}) ${this.quiz.questions[q - 1].question}`
        );
        this.updatePlayersProgress();
    }

    answer(p, ans) {
        if (ans.toLowerCase() === this.quiz.questions[p.question - 1].answer) {
            p.emit("answer", true);
            this.updateQuestion(p, p.question + 1);
        } else {
            p.emit("answer", false);
            this.updateQuestion(p, 1);
        }
    }

    updatePlayersProgress() {
        let playerProgress = {};
        this.players.forEach((p) => {
            playerProgress[p.name] = p.question;
        });
        this.emitAllPlayer("updatePlayersProgress", playerProgress);
    }
}

module.exports = Game;
