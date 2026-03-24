var express = require('express');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var path = require('path');

var indexRouter = require('./routers/index');
var authRouter = require('./routers/auth');
var chudeRouter = require('./routers/chude');
var taikhoanRouter = require('./routers/taikhoan');
var baivietRouter = require('./routers/baiviet');

var uri = 'mongodb+srv://admin:admin123@cluster0.ci790jr.mongodb.net/trangtin';
mongoose.connect(uri)
.then(() => console.log('Đã kết nối thành công tới MongoDB.'))
.catch(err => console.log(err));

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CHỈ GIỮ 1 DÒNG NÀY
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	name: 'iNews',
	secret: 'Mèo méo meo mèo meo',
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 30 * 24 * 60 * 60 * 1000
	}
}));

app.use((req, res, next) => {
	res.locals.session = req.session;

	var err = req.session.error;
	var msg = req.session.success;

	delete req.session.error;
	delete req.session.success;

	res.locals.message = '';
	if (err) res.locals.message = '<span class="text-danger">' + err + '</span>';
	if (msg) res.locals.message = '<span class="text-success">' + msg + '</span>';

	next();
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/chude', chudeRouter);
app.use('/taikhoan', taikhoanRouter);
app.use('/baiviet', baivietRouter);

app.listen(3000, () => {
	console.log('Server is running...');
});