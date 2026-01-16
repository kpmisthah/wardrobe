import { User } from "../models/userSchema.js"
const userAuth = async (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1) || req.query.ajax === 'true';
        if (isAjax) {
            return res.status(401).json({ error: 'Unauthorized', redirect: '/login' });
        }
        return res.redirect('/login')
    }
}
const userLogin = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/")
    } else {
        return next();
    }
}

const block = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return next();
        }

        const user = await User.findById(req.session.user);

        if (user.isBlocked) {
            req.session.destroy()
            const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1) || req.query.ajax === 'true';
            if (isAjax) {
                return res.status(401).json({ error: 'User Blocked', redirect: '/login' });
            }
            return res.redirect('/login');
        } else {
            return next();
        }

    } catch (error) {
        console.error('Block middleware error:', error);
        const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1) || req.query.ajax === 'true';
        if (isAjax) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.redirect('/login');
    }
};
export { userAuth, userLogin, block }  