import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column('text')
  content: string;

  @Column('int')
  chunkIndex: number;

  @Column('float', { array: true })
  embedding: number[];

  @CreateDateColumn()
  createdAt: Date;
}