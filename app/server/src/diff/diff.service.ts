import { Injectable } from '@nestjs/common';
import { diff, Diff } from 'deep-diff';

@Injectable()
export class DiffService {
  compare<T = any>(before: T, after: T): Diff<T, T>[] | undefined {
    return diff(before, after);
  }
}
