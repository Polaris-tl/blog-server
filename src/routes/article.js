const Router = require('koa-router')
const {
    getArticleList,
    getArticleById,
    getHotArticle,
    isUserLikeThisArticle,
    setLikeOrNotArticle,
    getArticlesById
} = require('../controller/article')
const router = new Router()

router.get('/article', getArticleList)
router.get('/article/:id', getArticleById)
router.get('/hot_article', getHotArticle)
router.get('/is_user_like_this_article', isUserLikeThisArticle)
router.get('/set_like_or_dislike', setLikeOrNotArticle)
router.post('/get_articles_by_uid', getArticlesById)

module.exports = router