var express = require('express');
var router = express.Router();
var firstImage = require('../modules/firstimage');
var ChuDe = require('../models/chude');
var BaiViet = require('../models/baiviet');

// GET: Trang chủ
router.get('/', async (req, res) => {
    // Lấy chuyên mục hiển thị vào menu và sắp xếp A-Z
    var cm = await ChuDe.find().sort({ TenChuDe: 1 });

    // Lấy 12 bài viết mới nhất
    var bv = await BaiViet.find({ KiemDuyet: 1 })
        .sort({ NgayDang: -1 })
        .populate('ChuDe')
        .populate('TaiKhoan')
        .limit(12)
        .exec();

    // Lấy 3 bài viết xem nhiều nhất hiển thị vào cột phải
    var xnn = await BaiViet.find({ KiemDuyet: 1 })
        .sort({ LuotXem: -1 })
        .populate('ChuDe')
        .populate('TaiKhoan')
        .limit(3)
        .exec();

    res.render('index', {
        title: 'Trang chủ',
        chuyenmuc: cm,
        baiviet: bv,
        xemnhieunhat: xnn,
        firstImage: firstImage
    });
});

// GET: Lấy các bài viết cùng mã chủ đề
router.get('/baiviet/chude/:id', async (req, res) => {
    var id = req.params.id;

    // Lấy chuyên mục hiển thị vào menu và sắp xếp A-Z
    var cm = await ChuDe.find().sort({ TenChuDe: 1 });

    // Lấy thông tin chủ đề hiện tại
    var cd = await ChuDe.findById(id);

    // Lấy 8 bài viết mới nhất cùng chuyên mục
    var bv = await BaiViet.find({ KiemDuyet: 1, ChuDe: id })
        .sort({ NgayDang: -1 })
        .populate('ChuDe')
        .populate('TaiKhoan')
        .limit(8)
        .exec();

    // Lấy 3 bài viết xem nhiều nhất hiển thị vào cột phải
    var xnn = await BaiViet.find({ KiemDuyet: 1, ChuDe: id })
        .sort({ LuotXem: -1 })
        .populate('ChuDe')
        .populate('TaiKhoan')
        .limit(3)
        .exec();

    res.render('baiviet_chude', {
        title: 'Bài viết cùng chuyên mục',
        chuyenmuc: cm,
        chude: cd,
        baiviet: bv,
        xemnhieunhat: xnn,
        firstImage: firstImage
    });
});

// GET: Xem bài viết
router.get('/baiviet/chitiet/:id', async (req, res) => {
    var id = req.params.id;

    // Lấy chuyên mục hiển thị vào menu và sắp xếp A-Z
    var cm = await ChuDe.find().sort({ TenChuDe: 1 });

    // Lấy thông tin bài viết hiện tại
    var bv = await BaiViet.findById(id)
        .populate('ChuDe')
        .populate('TaiKhoan')
        .exec();

    // =========================================================
    // CODE MỚI: Xử lý tăng lượt xem CHỐNG F5 (1 máy / 1 bài / 1 lần)
    // =========================================================
    
    // Tự động phân tích Cookie từ trình duyệt gửi lên (không cần cài thêm thư viện)
    var parsedCookies = {};
    if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach(function(c) {
            var parts = c.split('=');
if (parts.length >= 2) {
                parsedCookies[parts[0].trim()] = parts[1].trim();
            }
        });
    }

    var cookieName = 'da_xem_bai_' + id; // Tạo tên cookie riêng cho bài viết này
    
    // Nếu trong trình duyệt của người dùng CHƯA CÓ cookie này
    if (!parsedCookies[cookieName]) {
        // 1. Thực hiện tăng lượt xem trong Database
        await BaiViet.findByIdAndUpdate(id, { $inc: { LuotXem: 1 } });
        
        // 2. Gắn tem (cookie) vào trình duyệt máy đó để xác nhận đã xem. 
        // maxAge được thiết lập là 10 năm (10 * 365 ngày), F5 thoải mái sẽ không tăng nữa.
        res.cookie(cookieName, '1', { maxAge: 10 * 365 * 24 * 60 * 60 * 1000, httpOnly: true });
    }
    // =========================================================

    // Lấy 3 bài viết xem nhiều nhất hiển thị vào cột phải
    var xnn = await BaiViet.find({ KiemDuyet: 1 })
        .sort({ LuotXem: -1 })
        .populate('ChuDe')
        .populate('TaiKhoan')
        .limit(3)
        .exec();

    res.render('baiviet_chitiet', {
        chuyenmuc: cm,
        baiviet: bv,
        xemnhieunhat: xnn,
        firstImage: firstImage
    });
});

// GET: Tin mới nhất
router.get('/tinmoi', async (req, res) => {
    res.render('tinmoinhat', {
        title: 'Tin mới nhất'
    });
});

// POST: Kết quả tìm kiếm
router.post('/timkiem', async (req, res) => {
    var tukhoa = req.body.tukhoa;

    // Xử lý tìm kiếm bài viết
    var bv = await BaiViet.find({
        KiemDuyet: 1,
        TieuDe: { $regex: tukhoa, $options: 'i' }
    })
        .sort({ NgayDang: -1 })
        .populate('ChuDe')
        .populate('TaiKhoan')
        .exec();

    res.render('timkiem', {
        title: 'Kết quả tìm kiếm',
        baiviet: bv,
        tukhoa: tukhoa
    });
});

// GET: Lỗi
router.get('/error', async (req, res) => {
    res.render('error', {
        title: 'Lỗi'
    });
});

// GET: Thành công
router.get('/success', async (req, res) => {
    res.render('success', {
        title: 'Hoàn thành'
    });
});

module.exports = router;