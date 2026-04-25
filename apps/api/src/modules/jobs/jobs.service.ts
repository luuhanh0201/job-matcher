import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}
  async findAll(): Promise<Job[]> {
    const jobs = await this.jobRepository.find();
    return jobs;
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
