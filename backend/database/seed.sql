-- 插入测试数据到dating_app数据库

-- 清理现有数据
TRUNCATE TABLE interactions CASCADE;
TRUNCATE TABLE matches CASCADE;
TRUNCATE TABLE users CASCADE;

-- 插入测试用户数据
INSERT INTO users (id, name, age, avatar, gender, profession, height, zodiac, hometown, relationship_status, bio, looking_for, tags, photos) VALUES
(1, 'Alice', 26, 'https://picsum.photos/300/300?random=101', 'female', 'UI设计师', 165, '狮子座', '北京', 'single', '热爱设计和创意，喜欢咖啡厅和艺术展览。在现代科技与艺术的交界处寻找灵感。', '寻找能一起创造美好事物的灵魂伴侣', ARRAY['设计', '艺术', '咖啡', '展览'], ARRAY['https://picsum.photos/600/800?random=101', 'https://picsum.photos/600/800?random=201']),
(2, 'Tom', 29, 'https://picsum.photos/300/300?random=102', 'male', '前端工程师', 178, '水瓶座', '上海', 'single', '全栈开发者，热爱新技术。周末喜欢和朋友吃饭聊天，偶尔会去爬山。', '想找到一个可以一起探索这个世界的女孩', ARRAY['编程', '新技术', '吃饭', '爬山'], ARRAY['https://picsum.photos/600/800?random=102']),
(3, 'Sarah', 24, 'https://picsum.photos/300/300?random=103', 'female', '摄影师', 167, '天秤座', '深圳', 'single', '用镜头记录生活的美好，喜欢旅行和美食。目前在从事婚礼摄影。', '寻找一个愿意和我一起探索这个世界的男人', ARRAY['摄影', '旅行', '美食', '婚礼'], ARRAY['https://picsum.photos/600/800?random=103', 'https://picsum.photos/600/800?random=203']),
(4, 'Mike', 27, 'https://picsum.photos/300/300?random=104', 'male', '创业者', 175, '射手座', '杭州', 'single', '正在创业，喜欢钻研商业模式。周末会参加各种创业交流会。', '寻找事业有成的女性一起创业', ARRAY['创业', '商业', '交流', '创新'], ARRAY['https://picsum.photos/600/800?random=104']),
(5, 'Jenny', 25, 'https://picsum.photos/300/300?random=105', 'female', '市场营销', 168, '双鱼座', '广州', 'single', '数据分析爱好者，热爱深度思考。喜欢读书和冥想解压。', '寻找有思想的男性一起探讨人生', ARRAY['市场', '数据', '读书', '冥想'], ARRAY['https://picsum.photos/600/800?random=105']),
(6, 'Alex', 28, 'https://picsum.photos/300/300?random=106', 'male', '医生', 180, '金牛座', '南京', 'single', '外科医生，工作认真负责。业余时间喜欢瑜伽和冥想，追求平衡的人生。', '希望找到一个在内心里平和的女生', ARRAY['医疗', '瑜伽', '冥想', '养生'], ARRAY['https://picsum.photos/600/800?random=106']);

-- 可以添加更多测试用户根据需要

COMMIT;
