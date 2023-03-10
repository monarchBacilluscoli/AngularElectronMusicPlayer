import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ISong } from '../model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  //? subject是一种多分发的信源
  currentProgress$ = new BehaviorSubject(0);
  currentTime$ = new Subject();

  @ViewChild('player', { static: true }) player!: ElementRef;

  songs: ISong[] = [];

  audio = new Audio();
  isPlaying = false;
  activeSong: any;
  durationTime!: string | null;

  ngOnInit() {
    this.songs = this.getListOfSongs();

    this.player.nativeElement.src = this.songs[0];
    this.player.nativeElement.load();
    this.activeSong = this.songs[0];
    this.isPlaying = false;
  }

  playSong(song: ISong): void {
    this.durationTime = null;
    this.audio.pause();

    this.player.nativeElement.src = song.path;
    this.player.nativeElement.load();
    this.player.nativeElement.play();
    this.activeSong = song;
    this.isPlaying = true;

    console.warn("测试");
  }

  onTimeUpdate() {

    // Set song duration time
    if (!this.durationTime) {
      this.setSongDuration();
    }

    // Emit converted audio currenttime in user friendly ex. 01:15
    const currentMinutes = this.generateMinutes(this.player.nativeElement.currentTime);
    const currentSeconds = this.generateSeconds(this.player.nativeElement.currentTime);
    this.currentTime$.next(this.generateTimeToDisplay(currentMinutes, currentSeconds));


    // Emit amount of song played percents
    const percents = this.generatePercentage(this.player.nativeElement.currentTime, this.player.nativeElement.duration);
    if (!isNaN(percents)) {
      this.currentProgress$.next(percents);
    }

  }

  // Play song that comes after active song
  playNextSong(): void {
    const nextSongIndex = this.songs.findIndex((song) => song.id === this.activeSong.id + 1);

    if (nextSongIndex === -1) {
      this.playSong(this.songs[0]);
    } else {
      this.playSong(this.songs[nextSongIndex]);
    }
  }

  // Play song that comes before active song
  playPreviousSong(): void {
    const prevSongIndex = this.songs.findIndex((song) => song.id === this.activeSong.id - 1);
    if (prevSongIndex === -1) {
      this.playSong(this.songs[this.songs.length - 1]);
    } else {
      this.playSong(this.songs[prevSongIndex]);
    }
  }

  // Calculate song duration and set it to user friendly format, ex. 01:15
  setSongDuration(): void {
    const durationInMinutes = this.generateMinutes(this.player.nativeElement.duration);
    const durationInSeconds = this.generateSeconds(this.player.nativeElement.duration);

    if (!isNaN(this.player.nativeElement.duration)) {
      this.durationTime = this.generateTimeToDisplay(durationInMinutes, durationInSeconds);
    }
  }

  // Generate minutes from audio time
  generateMinutes(currentTime: number): number {
    return Math.floor(currentTime / 60);
  }

  // Generate seconds from audio time
  generateSeconds(currentTime: number): number | string {
    const secsFormula = Math.floor(currentTime % 60);
    return secsFormula < 10 ? '0' + String(secsFormula) : secsFormula;
  }

  generateTimeToDisplay(currentMinutes: number | string, currentSeconds: number | string): string {
    return `${currentMinutes}:${currentSeconds}`;
  }

  // Generate percentage of current song
  generatePercentage(currentTime: number, duration: number): number {
    return Math.round((currentTime / duration) * 100);
  }

  onPause(): void {
    this.isPlaying = false;
    this.currentProgress$.next(0);
    this.currentTime$.next('0:00');
    this.durationTime = '0:00';
  }

  onProcessChange(value: number): void {
    console.warn(value);

    this.player.nativeElement.currentTime = this.player.nativeElement.duration * value / 100;
  }

  onPlay(): void {
    console.warn('播放');
  }

  getListOfSongs(): ISong[] {
    //todo 找到asset下所有的音频文件
    return [
      {
        id: 1,
        title: '03. That\'s The Way It Is.flac',
        path: './assets/03. That\'s The Way It Is.flac'
      },
      {
        id: 2,
        title: 'Numb (Official Video) - Linkin Park.mp3',
        path: './assets/Numb (Official Video) - Linkin Park.mp3'
      },
      {
        id: 3,
        title: 'System Of A Down - Toxicity (Official Video).mp3',
        path: './assets/System Of A Down - Toxicity (Official Video).mp3'
      }
    ];
  }
}