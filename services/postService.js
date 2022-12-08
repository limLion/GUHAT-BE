
const { LecturePost, Lecture, User, Role, RoleApplier} = require("../models");

module.exports = {
    /* ------ POST : 게시물 생성 ------ */
    createPost: async (userId, body) => {
        try {
            const newPost = await LecturePost.create({
                id: body.id,
                title : body.title,
                endDate: body.endDate,
                detail: body.detail,
                priority: body.priority,
                chatLink: body.chatLink,
                viewCnt: body.viewCnt,
                status: body.status,
                period: body.period,
                //외래키
                writer_id: userId,
                lecture_id: body.lecture_id,
            });
            console.log("body.role", body.role.length);
            for(let r = 0; r < body.role.length; r++) {
                // 새 그룹 생성
                const newRole = await Role.create({
                    name: body.role[r].name,
                    max: body.role[r].max,
                    lecturePost_id: newPost.id
                })
                // console.log("role exists? : ");
                // console.log(newRole.id);
            }
            console.log("newPost exists? : ");
            console.log(newPost.id);
            return {
                type: "Success",
                message: "You successfully created a new post!",
                postId: newPost.dataValues.id
            }
        } catch(err) {
            console.log(err);
            return {
                type: "Error",
                message: err.toString()
            }
        }
        
    },
    /* ------ POST : 게시물 생성 끝 ------ */
    /* ------ POST : 팀플 지원하기 ------- */
    apply: async (userId, postId, roleId) => {
        try{
            // 이 포스트에 있는 기존 지원자 리스트 가져오기
            const existApplier = await RoleApplier.findAll({
                where: {
                    lecturePost_id: postId
                }
            });
    
            // 지원하기를 두 번 눌렀을 경우
            for(let a = 0; a < existApplier.length; a++) {
                if(existApplier[a].user_id == userId) {
                    return {
                        type: "Error",
                        message: "User already applied to this post!"
                    }
                }   
            }
            // 새 지원자 생성
            const newApplier = await RoleApplier.create({
                group_id: roleId,
                user_id: userId,
                lecturePost_id: postId
            });
            console.log("newApplier exists? : " , newApplier.id);
            return {
                type: 'Success',
                statusCode: 200,
                message: "You successfully applied to the lecture!",
                userId: userId,
                applierId: newApplier.id
            };
        }catch(err) {
            console.log(err);
            return {
                type: "Error",
                message: err.toString()
            }
        }
    },
    /* ---------- POST : 팀플 지원하기 끝 ----------- */
    /* ------- GET : 구인글 리스트 모두 조회 -------- */
    findAllPosts: async (sort) => {
        try{
            const result = await LecturePost.findAll();
            const data_list = [];

            const posts = result.map( res => res.dataValues);
            // lecture_id가 id인 과목 가져오기
            for (let p = 0; p < posts.length; p++) {
                console.log(posts[p]);
                const lecture = await Lecture.findOne({
                    where: {
                        id: posts[p].lecture_id
                    }
                });

                const writer = await User.findOne({
                    where: {id: posts[p].writer_id}
                });

                data_list.push({
                    postId: posts[p].id, 
                    title: posts[p].title,
                    writer: writer.nickname,
                    writerLevel: writer.level,
                    viewCnt: posts[p].viewCnt,
                    endDate: posts[p].endDate,
                    status: posts[p].status,
                    lectureName: lecture.name,
                    professor: lecture.professor,
                    schedule: lecture.schedule,
                    createdAt: posts[p].createdAt
                })
            }
            // sort 옵션별로 변수 지정
            const sorted_list = data_list.sort(function(a, b) {
                if(sort === "popular") { // 조회순
                    if(a.viewCnt > b.viewCnt) {
                        return -1; 
                    }
                    else if(a.viewCnt < b.viewCnt) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                }
                else if(sort === "level") { // 레벨순
                    if(a.writerLevel > b.writerLevel) {
                        return 1;
                    }
                    else if(a.writerLevel < b.writerLevel) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                }
                else { // sort === null 이면 최신순
                    if(a.createdAt > b.createdAt) {
                        return -1;
                    }
                    else if(a.createdAt < b.createdAt) {
                        return 1;
                    }
                    else {
                        return 0;
                    }   
                }
            })
            
            return sorted_list;
            
        } catch(err) {
            console.log(err);
            throw Error(err);
        }
    },
    /* ------- GET : 구인글 리스트 모두 조회 끝 -------- */
    /* ------- GET : 작성한 구인글 리스트 조회 --------- */
    findMyPosts: async (writer_id, sort) => {
        try{
            // writer_id == writer_id 인 LecturePost들 가져오기
            const data_list = [];
            // lecture_id가 id인 과목 가져오기
            const result = await LecturePost.findAll({
                where : {
                    writer_id : writer_id
                }
            })
            const posts = result.map( res => res.dataValues );
          
            for(let p = 0 ; p < posts.length ; p++){
                const post = posts[p];
                console.log(post);
                const lecture =  await Lecture.findOne({
                    where : {
                        id: post.lecture_id
                    }
                });
                console.log("lecture: " + lecture);
                const writer = await User.findOne({
                    where: {id: post.writer_id}
                });
                console.log("이거야 : " + writer);
                data_list.push({
                    postId: post.id, 
                    title: post.title,
                    writer: writer.nickname, // 작성자 닉네임,
                    writerLevel: writer.level,
                    viewCnt: post.viewCnt,
                    endDate: post.endDate,
                    status: post.status,
                    lectureName: lecture.name,
                    professor: lecture.professor,
                    schedule: lecture.schedule,
                    createdAt: post.createdAt
                })
            }
            // sort 옵션별로 변수 지정
            const sorted_list = data_list.sort(function(a, b) {
                if(sort === "popular") { // 조회순
                    if(a.viewCnt > b.viewCnt) {
                        return -1; 
                    }
                    else if(a.viewCnt < b.viewCnt) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                }
                else { // sort === null 이면 최신순
                    if(a.createdAt > b.createdAt) {
                        return -1;
                    }
                    else if(a.createdAt < b.createdAt) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                    
                }
            })
            
            return sorted_list;
            
        } catch(err) {
            console.log(err);
            return {
                type: "Error",
                message: err.toString()
            }
        }
    },
    /* ------- GET : 작성한 구인글 리스트 조회 --------- */
}