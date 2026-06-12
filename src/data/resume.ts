import type { Resume } from '@/types';

export const mockResume: Resume = {
  id: 'resume001',
  name: '李明',
  avatar: 'https://picsum.photos/id/177/200/200',
  gender: 'male',
  age: 26,
  phone: '138****8888',
  location: '本市朝阳区',
  experience: '3年',
  education: '高中',
  expectedSalary: '5000-7000',
  expectedPosition: '店员/服务员/配送员',
  certificates: [
    {
      id: 'cert1',
      name: '健康证',
      issueDate: '2025-07-01',
      expireDate: '2026-07-01',
      isExpiring: true,
    },
    {
      id: 'cert2',
      name: '食品经营从业人员培训证',
      issueDate: '2025-03-15',
      expireDate: '2027-03-15',
      isExpiring: false,
    },
    {
      id: 'cert3',
      name: '电动车驾驶证',
      issueDate: '2023-05-20',
      expireDate: '2029-05-20',
      isExpiring: false,
    },
  ],
  availableTime: [
    { day: '周一', periods: ['上午', '下午', '晚上'] },
    { day: '周二', periods: ['上午', '下午', '晚上'] },
    { day: '周三', periods: ['上午', '下午', '晚上'] },
    { day: '周四', periods: ['上午', '下午'] },
    { day: '周五', periods: ['上午', '下午', '晚上'] },
    { day: '周六', periods: ['下午', '晚上'] },
    { day: '周日', periods: ['休息'] },
  ],
  workHistory: [
    {
      id: 'wh1',
      company: '瑞幸咖啡(中山店)',
      position: '咖啡师',
      startDate: '2024-03',
      endDate: '2026-04',
      description: '负责咖啡饮品制作、收银、顾客接待，曾获月度服务之星',
    },
    {
      id: 'wh2',
      company: '麦当劳',
      position: '服务员',
      startDate: '2022-06',
      endDate: '2024-02',
      description: '负责点餐、配餐、清洁，熟悉餐饮服务流程',
    },
  ],
  introduction: '本人性格开朗，工作认真踏实，有3年餐饮服务行业经验，善于沟通，能吃苦耐劳，可适应快节奏工作环境，期待加入贵团队。',
};

export const favoriteJobsIds = ['job002', 'job006'];
