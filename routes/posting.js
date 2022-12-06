require("dotenv").config();
const { authChecker } = require("../middlewares/authValidation");
const express = require("express");
const postController = require("../controllers/postController");
const router = express.Router();

console.log("conneceted router posting");
router.post("/lecture", authChecker, postController.createPost);
router.post("/lecture/apply", authChecker, postController.apply);

router.get("/lecture/all", authChecker, postController.getAllPost); // 구인글 리스트 조회
router.get("/lecture", authChecker, postController.getMyPost); // 작성한 구인글 상세 조회
router.get("/lecture/:postId", authChecker, postController.getPosting); // 구인글 상세 조회
router.get("/lecture/member", authChecker, postController.getAllAppliers); // 작성한 구인글 지원자 리스트 조회
router.get("/lecture/apply", authChecker, postController.getMyApplyPosting); // 내가 지원한 구인글 리스트 조회

router.patch("/lecture/member", authChecker, postController.updateApplyStatus); // 구인글 지원상태 변경



module.exports = router;