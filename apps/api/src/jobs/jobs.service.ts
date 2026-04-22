import { Injectable } from '@nestjs/common';

@Injectable()
export class JobsService {
  findAll() {
    return [
      {
        id: 1,
        title: 'Frontend Developer 123',
        company: 'OpenAI',
        location: 'Remote',
        salary: 2000,
      },
      {
        id: 2,
        title: 'Backend Developer',
        company: 'Google',
        location: 'Hanoi',
        salary: 2500,
      },
      {
        id: 3,
        title: 'Fullstack Developer',
        company: 'Meta',
        location: 'Ho Chi Minh City',
        salary: 3000,
      },
    ];
  }

  findOne(id: number) {
    return {
      id,
      title: 'Frontend Developer',
      company: 'OpenAI',
      location: 'Remote',
      salary: 2000,
    };
  }

  create(createJobDto: unknown) {
    return {
      message: 'Job created',
      data: createJobDto,
    };
  }

  update(id: number, updateJobDto: unknown) {
    return {
      message: `Job ${id} updated`,
      data: updateJobDto,
    };
  }

  remove(id: number) {
    return {
      message: `Job ${id} deleted`,
    };
  }
}
