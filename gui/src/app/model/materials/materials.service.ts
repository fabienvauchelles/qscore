import {Observable} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Material} from './material.model';



@Injectable()
export class MaterialsService {

    constructor(private _http: HttpClient) {
    }


    getAllMaterials(competitionId: string): Observable<Material[]> {
        return this
            ._http
            .get<Material[]>(`api/competitions/${competitionId}/materials`)
        ;
    }


    createMaterial(
        competitionId: string,
        datafile: File
    ): Observable<Material> {
        const data = new FormData();
        data.append('datafile', datafile);
        data.append('filename', datafile.name);

        return this
            ._http
            .post<Material>(`api/competitions/${competitionId}/materials`, data)
        ;
    }


    removeMaterialById(
        competitionId: string,
        materialId: string
    ): Observable<void> {
        return this
            ._http
            .delete<void>(`api/competitions/${competitionId}/materials/${materialId}`)
        ;
    }
}
